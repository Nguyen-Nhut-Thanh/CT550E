import type { Prisma } from '@prisma/client';
import { CREW_ROLES, type CrewContactSnapshot, type CrewRole, type RegionCode } from 'shared';

export const CREW_LOCK_LEAD_MS = 24 * 60 * 60 * 1000;
export const crewDetails = { user: { select: {
    full_name: true, phone: true, is_staff: true,
    accounts: { select: { status: true } },
    employee_profile: { select: { status: true, regions: true } },
    role_users: { select: { roles: { select: { name: true } } } },
} } } satisfies Prisma.schedule_crewInclude;

type Crew = Prisma.schedule_crewGetPayload<{ include: typeof crewDetails }>;
export function crewReadiness(row: { operating_region: string | null; crew_required_count: number; crew: Crew[] }) {
    const eligible = row.crew.filter(item => item.user.is_staff && item.user.accounts.status === 1 && item.user.employee_profile?.status === 'active'
        && (item.user.role_users.some(link => link.roles.name === 'admin') || item.user.employee_profile.regions.includes(row.operating_region!))
        && item.roles.every(role => item.user.role_users.some(link => link.roles.name === role)));
    const confirmed = eligible.filter(item => ['confirmed', 'completed'].includes(item.status));
    const issues: string[] = [];
    if (!row.operating_region) issues.push('Chưa xác định miền điều hành.');
    if (row.crew.length < row.crew_required_count) issues.push(`Cần thêm ${row.crew_required_count - row.crew.length} nhân sự để đạt mức tối thiểu.`);
    for (const role of ['tour_leader', 'guide'] as const) if (!row.crew.some(item => item.roles.includes(role))) issues.push(`Chưa phân công vai trò ${CREW_ROLES[role]}.`);
    const pending = eligible.filter(item => item.status === 'pending').length;
    const declined = eligible.filter(item => item.status === 'declined').length;
    if (pending) issues.push(`${pending} nhân sự đang chờ nhận chuyến.`);
    if (declined) issues.push(`${declined} nhân sự đã từ chối; cần thay người hoặc gỡ phân công.`);
    if (eligible.length < row.crew.length) issues.push(`${row.crew.length - eligible.length} phân công không còn hợp lệ do tài khoản, vai trò hoặc miền hỗ trợ.`);
    return { confirmed, issues, ready: issues.length === 0 };
}

export function readCrewSnapshot(value: unknown): CrewContactSnapshot | null {
    if (!value || typeof value !== 'object') return null;
    const row = value as Partial<CrewContactSnapshot>;
    if (!Number.isInteger(row.revision) || !Array.isArray(row.members) || typeof row.published_at !== 'string' || !['north', 'central', 'south'].includes(row.operating_region ?? '')) return null;
    if (row.members.some(member => !member || typeof member.full_name !== 'string' || !Array.isArray(member.roles))) return null;
    return row as CrewContactSnapshot;
}

export async function notifyCrewCustomers(tx: Prisma.TransactionClient, scheduleId: number, snapshot: CrewContactSnapshot, now = new Date()) {
    const schedule = await tx.tour_schedules.findUniqueOrThrow({ where: { tour_schedule_id: scheduleId }, select: { code: true, tours: { select: { name: true } } } });
    const bookings = await tx.bookings.findMany({ where: { tour_schedule_id: scheduleId, status: { in: ['paid', 'confirmed', 'completed'] } }, select: { booking_id: true, user_id: true } });
    if (!bookings.length) return 0;
    const contacts = snapshot.members.map(member => `${member.full_name} (${member.roles.map(role => CREW_ROLES[role]).join(' kiêm ')})${member.phone ? ` · ${member.phone}` : ''}`).join('; ');
    const result = await tx.membership_notifications.createMany({ data: bookings.map(booking => ({
        user_id: booking.user_id, booking_id: booking.booking_id,
        event_key: `crew:${booking.booking_id}:${snapshot.revision}`,
        title: snapshot.revision > 1 ? 'Cập nhật người phụ trách chuyến đi' : 'Thông tin người phụ trách chuyến đi',
        message: `${schedule.tours.name} · ${schedule.code || `Chuyến ${scheduleId}`} · Đơn #${booking.booking_id}: ${contacts}. Xem chi tiết đặt tour để kiểm tra thông tin mới nhất.`,
        created_at: now,
    })), skipDuplicates: true });
    return result.count;
}

/** Caller may already hold this row lock; taking it again in the same transaction is safe. */
export async function finalizeCrewIfReady(tx: Prisma.TransactionClient, scheduleId: number, actorId = 0, now = new Date()) {
    await tx.$queryRaw`SELECT tour_schedule_id FROM tour_schedules WHERE tour_schedule_id = ${scheduleId} FOR UPDATE`;
    const schedule = await tx.tour_schedules.findUnique({ where: { tour_schedule_id: scheduleId }, include: { crew: { include: crewDetails } } });
    if (!schedule || schedule.status !== 1 || schedule.end_date <= now) return false;
    const previous = readCrewSnapshot(schedule.crew_snapshot);
    if (schedule.crew_locked_at && previous) {
        await notifyCrewCustomers(tx, scheduleId, previous, now);
        return true;
    }
    const assessment = crewReadiness(schedule);
    if (!assessment.ready) return false;
    const members = [...assessment.confirmed].sort((a, b) => a.user_id - b.user_id).map(item => ({
        user_id: item.user_id, full_name: item.user.full_name, phone: item.user.phone,
        roles: (Object.keys(CREW_ROLES) as CrewRole[]).filter(role => item.roles.includes(role)),
    }));
    // PostgreSQL JSONB can reorder object keys; compare normalized values to avoid
    // issuing a new revision and duplicate notices after an unchanged save.
    const signature = (region: string | null, contacts: CrewContactSnapshot['members']) => JSON.stringify([
        region, [...contacts].sort((a, b) => a.user_id - b.user_id).map(member => [member.user_id, member.full_name, member.phone, [...member.roles].sort()]),
    ]);
    const same = previous && signature(previous.operating_region, previous.members) === signature(schedule.operating_region, members);
    const snapshot: CrewContactSnapshot = same ? previous : {
        revision: schedule.crew_revision + 1, published_at: now.toISOString(), operating_region: schedule.operating_region as RegionCode, members,
    };
    await tx.tour_schedules.update({ where: { tour_schedule_id: scheduleId }, data: { crew_locked_at: now, crew_locked_by: actorId || null, crew_revision: snapshot.revision, crew_snapshot: snapshot as unknown as Prisma.InputJsonValue } });
    await tx.workforce_events.create({ data: { actor_user_id: actorId, tour_schedule_id: scheduleId, region_code: schedule.operating_region, action: 'crew_finalized', details: { revision: snapshot.revision, late: now.getTime() > schedule.start_date.getTime() - CREW_LOCK_LEAD_MS, changed: !same } } });
    await notifyCrewCustomers(tx, scheduleId, snapshot, now);
    return true;
}
