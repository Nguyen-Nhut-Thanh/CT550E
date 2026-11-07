import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ADMIN_CONTENT_DENIED, CREW_ROLES, WORKFORCE_REGIONS, WORKFORCE_ROLES, type CrewPayload, type CrewRole, type EmployeePayload, type RegionCode, type StaffShiftPayload, type WorkforceActor } from 'shared';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { WorkforceAccessService } from './workforce-access.service';
import { CREW_LOCK_LEAD_MS, crewDetails, crewReadiness, finalizeCrewIfReady, readCrewSnapshot } from './crew-finalization';
import { inferOperatingRegion } from './operating-region';

const rosterInclude = { user: { select: { full_name: true, phone: true } } };
const crewInclude = crewDetails;
const employeeInclude = { user: { include: { accounts: { select: { email: true, status: true } }, role_users: { include: { roles: true } } } } };
const busyStatuses = ['pending', 'confirmed', 'completed'];
function text(value: unknown, label: string, max: number, required = false): string {
    if (value == null && !required) return '';
    if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) throw new BadRequestException(`${label} không hợp lệ.`);
    return value.trim();
}
function regionCode(value: unknown): RegionCode {
    if (typeof value !== 'string' || !Object.hasOwn(WORKFORCE_REGIONS, value)) throw new BadRequestException('Miền phụ trách không hợp lệ.');
    return value as RegionCode;
}
function date(value: unknown) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) throw new BadRequestException('Ngày giờ cần hợp lệ và có múi giờ.');
    return new Date(value);
}
function id(value: unknown) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) throw new BadRequestException('Nhân viên không hợp lệ.');
    return value;
}

@Injectable()
export class WorkforceService {
    constructor(private readonly prisma: PrismaService, private readonly access: WorkforceAccessService) {}
    private scoped(actor: WorkforceActor, region?: string) {
        if (region) { const code = regionCode(region); if (!actor.isManager) this.access.region(actor, code); return code; }
        return actor.isManager ? undefined : { in: actor.regions };
    }
    private async lockPeople(tx: Prisma.TransactionClient, ids: number[]) {
        const sorted = [...new Set(ids)].sort((a, b) => a - b);
        if (sorted.length) await tx.$queryRaw(Prisma.sql`SELECT user_id FROM users WHERE user_id IN (${Prisma.join(sorted)}) ORDER BY user_id FOR UPDATE`);
    }
    private async event(tx: Prisma.TransactionClient, actor: WorkforceActor, action: string, details: object, extra: { target_user_id?: number; tour_schedule_id?: number; region_code?: string | null } = {}) {
        await tx.workforce_events.create({ data: { actor_user_id: actor.userId, action, details: JSON.parse(JSON.stringify(details)), ...extra } });
    }
    private employeeData(body: EmployeePayload, actor: WorkforceActor) {
        this.access.manager(actor);
        if (!body || !Array.isArray(body.roles) || !body.roles.length || body.roles.some(role => !Object.hasOwn(WORKFORCE_ROLES, role)) || new Set(body.roles).size !== body.roles.length) throw new BadRequestException('Vai trò nhân viên không hợp lệ.');
        if (!Array.isArray(body.regions) || new Set(body.regions).size !== body.regions.length) throw new BadRequestException('Danh sách miền không hợp lệ.');
        const regions = body.regions.map(regionCode);
        const primary = body.primary_region == null ? null : regionCode(body.primary_region);
        if ((!body.roles.includes('admin') && !regions.length) || (primary && !regions.includes(primary))) throw new BadRequestException('Cần miền phụ trách; miền chính phải nằm trong danh sách miền được hỗ trợ.');
        if (!actor.isAdmin && (body.roles.some(role => ['admin', 'region_manager'].includes(role)) || regions.some(region => !actor.regions.includes(region)))) throw new ForbiddenException('Quản lý miền chỉ được cấp vai trò nhân viên và phạm vi thuộc miền mình quản lý.');
        if (!['active', 'inactive'].includes(body.status) || !['full_time', 'contractor'].includes(body.employment_type)) throw new BadRequestException('Trạng thái nhân viên không hợp lệ.');
        if (!Array.isArray(body.languages) || body.languages.length > 20) throw new BadRequestException('Ngoại ngữ không hợp lệ.');
        return { full_name: text(body.full_name, 'Họ tên', 150, true), phone: text(body.phone, 'Số điện thoại', 15) || null,
            employee_code: text(body.employee_code, 'Mã nhân viên', 30, true), position: text(body.position, 'Chức danh', 100, true),
            primary_region: primary, regions, employment_type: body.employment_type, status: body.status,
            languages: body.languages.map(value => text(value, 'Ngoại ngữ', 50, true)), note: text(body.note, 'Ghi chú', 2000) || null };
    }
    async employees(actor: WorkforceActor, region?: string) {
        this.access.manager(actor);
        const scope = this.scoped(actor, region);
        const rows = await this.prisma.employee_profiles.findMany({ where: scope === undefined ? {} : { regions: typeof scope === 'string' ? { has: scope } : { hasSome: actor.regions } }, include: employeeInclude, orderBy: { employee_code: 'asc' } });
        return rows.map(({ user, ...profile }) => ({ ...profile, full_name: user.full_name, phone: user.phone, email: user.accounts.email,
            account_status: user.accounts.status, roles: user.role_users.map(item => item.roles.name).filter(role => Object.hasOwn(WORKFORCE_ROLES, role)) }));
    }
    async createEmployee(actor: WorkforceActor, body: EmployeePayload) {
        const data = this.employeeData(body, actor);
        const email = text(body.email, 'Email', 150, true).toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 72) throw new BadRequestException('Email hoặc mật khẩu không hợp lệ (mật khẩu từ 8 đến 72 ký tự).');
        const password_hash = await bcrypt.hash(body.password, 10);
        try {
            return await this.prisma.$transaction(async tx => {
                const { full_name, phone, ...profile } = data;
                const user = await tx.users.create({ data: { full_name, phone, is_staff: true, profile_completed: true,
                    accounts: { create: { email, password_hash, provider: 'local', email_verified: true, email_verified_at: new Date() } },
                    employee_profile: { create: profile } } });
                const roles = await tx.roles.findMany({ where: { name: { in: body.roles } } });
                if (roles.length !== body.roles.length) throw new BadRequestException('Chưa cài đặt đầy đủ vai trò nhân viên.');
                await tx.role_users.createMany({ data: roles.map(role => ({ user_id: user.user_id, role_id: role.role_id })) });
                await this.event(tx, actor, 'employee_created', { roles: body.roles, regions: data.regions }, { target_user_id: user.user_id, region_code: data.primary_region });
                return { user_id: user.user_id };
            });
        } catch (error) { if ((error as { code?: string }).code === 'P2002') throw new ConflictException('Email, số điện thoại hoặc mã nhân viên đã tồn tại.'); throw error; }
    }
    async updateEmployee(actor: WorkforceActor, userId: number, body: EmployeePayload) {
        const data = this.employeeData(body, actor);
        try {
            return await this.prisma.$transaction(async tx => {
                await this.lockPeople(tx, [userId]);
                const current = await tx.employee_profiles.findUnique({ where: { user_id: userId }, include: employeeInclude });
                if (!current) throw new NotFoundException('Không tìm thấy nhân viên.');
                const oldRoles = current.user.role_users.map(item => item.roles.name);
                if (!actor.isAdmin && (oldRoles.some(role => ['admin', 'region_manager'].includes(role)) || current.regions.some(region => !actor.regions.includes(region as RegionCode)))) throw new ForbiddenException('Bạn không được chỉnh sửa quản lý hoặc hồ sơ ngoài phạm vi mình.');
                if (actor.userId === userId && (data.status !== 'active' || (actor.isAdmin && !body.roles.includes('admin')))) throw new BadRequestException('Không thể tự vô hiệu hóa hoặc gỡ quyền quản trị của chính mình.');
                const futureCrew = await tx.schedule_crew.findMany({ where: { user_id: userId, status: { in: busyStatuses }, release_at: { gt: new Date() } }, include: { schedule: { select: { operating_region: true } } } });
                const shifts = await tx.staff_shifts.findMany({ where: { user_id: userId, status: 'scheduled', ends_at: { gt: new Date() } } });
                if ((data.status !== 'active' && (futureCrew.length || shifts.length)) ||
                    futureCrew.some(item => item.roles.some(role => !body.roles.includes(role as CrewRole)) || (!body.roles.includes('admin') && !data.regions.includes(item.schedule.operating_region as RegionCode))) ||
                    shifts.some(item => (item.duty_type === 'page' && !body.roles.includes('page_staff')) || (item.region_code && !data.regions.includes(item.region_code as RegionCode)))) {
                    throw new ConflictException('Cần hủy hoặc chuyển các ca trực, chuyến sắp tới trước khi thu hẹp quyền hay ngưng nhân viên.');
                }
                const { full_name, phone, ...profile } = data;
                await tx.users.update({ where: { user_id: userId }, data: { full_name, phone, is_staff: true } });
                await tx.employee_profiles.update({ where: { user_id: userId }, data: profile });
                await tx.role_users.deleteMany({ where: { user_id: userId, roles: { name: { in: Object.keys(WORKFORCE_ROLES) } } } });
                const roles = await tx.roles.findMany({ where: { name: { in: body.roles } } });
                await tx.role_users.createMany({ data: roles.map(role => ({ user_id: userId, role_id: role.role_id })) });
                await this.event(tx, actor, 'employee_updated', { before: { roles: oldRoles, regions: current.regions, status: current.status }, after: { roles: body.roles, regions: data.regions, status: data.status } }, { target_user_id: userId, region_code: data.primary_region });
                return { user_id: userId };
            });
        } catch (error) { if ((error as { code?: string }).code === 'P2002') throw new ConflictException('Mã nhân viên hoặc số điện thoại đã tồn tại.'); throw error; }
    }
    async shifts(actor: WorkforceActor, region?: string) {
        const scope = this.scoped(actor, region);
        return this.prisma.staff_shifts.findMany({ where: {
            ...(actor.isManager ? { ...(scope === undefined ? {} : { region_code: scope }) } : { user_id: actor.userId }),
            ends_at: { gte: new Date(Date.now() - 30 * 86400000) },
        }, include: rosterInclude, orderBy: { starts_at: 'asc' }, take: 500 });
    }
    private async available(tx: Prisma.TransactionClient, userId: number, start: Date, end: Date, excludeSchedule?: number) {
        const shift = await tx.staff_shifts.findFirst({ where: { user_id: userId, status: 'scheduled', starts_at: { lt: end }, ends_at: { gt: start } } });
        const crew = await tx.schedule_crew.findFirst({ where: { user_id: userId, status: { in: busyStatuses }, report_at: { lt: end }, release_at: { gt: start }, ...(excludeSchedule ? { tour_schedule_id: { not: excludeSchedule } } : {}) } });
        if (shift || crew) throw new ConflictException('Nhân viên bị trùng ca trực, lịch nghỉ hoặc thời gian đi tour / điều động.');
    }
    async createShift(actor: WorkforceActor, body: StaffShiftPayload) {
        this.access.manager(actor);
        const userId = id(body?.user_id), starts_at = date(body.starts_at), ends_at = date(body.ends_at);
        if (ends_at <= starts_at || ends_at <= new Date() || !['page', 'leave'].includes(body.duty_type)) throw new BadRequestException('Loại ca hoặc khoảng thời gian không hợp lệ.');
        const region = body.region_code == null && body.duty_type === 'leave' ? null : regionCode(body.region_code);
        const note = text(body.note, 'Ghi chú', 1000) || null;
        return this.prisma.$transaction(async tx => {
            await this.lockPeople(tx, [userId]);
            const employee = await this.access.actor(userId, undefined, tx);
            if (region) { this.access.region(actor, region); if (!employee.regions.includes(region) && !employee.isAdmin) throw new BadRequestException('Nhân viên chưa được phân công hỗ trợ miền này.'); }
            else if (!actor.isAdmin) throw new ForbiddenException('Quản lý miền cần chọn miền khi ghi lịch nghỉ.');
            if (body.duty_type === 'page' && !employee.roles.includes('page_staff')) throw new BadRequestException('Nhân viên cần có vai trò trực page.');
            await this.available(tx, userId, starts_at, ends_at);
            const shift = await tx.staff_shifts.create({ data: { user_id: userId, duty_type: body.duty_type, region_code: region, starts_at, ends_at, note, created_by: actor.userId } });
            await this.event(tx, actor, 'shift_created', { shift_id: shift.shift_id, duty_type: body.duty_type, starts_at, ends_at }, { target_user_id: userId, region_code: region });
            return shift;
        });
    }
    async cancelShift(actor: WorkforceActor, shiftId: number) {
        this.access.manager(actor);
        return this.prisma.$transaction(async tx => {
            const shift = await tx.staff_shifts.findUnique({ where: { shift_id: shiftId } });
            if (!shift) throw new NotFoundException('Không tìm thấy ca trực.');
            this.access.region(actor, shift.region_code);
            await this.lockPeople(tx, [shift.user_id]);
            const current = await tx.staff_shifts.findUniqueOrThrow({ where: { shift_id: shiftId } });
            if (current.status === 'cancelled') return current;
            const result = await tx.staff_shifts.update({ where: { shift_id: shiftId }, data: { status: 'cancelled' } });
            await this.event(tx, actor, 'shift_cancelled', { shift_id: shiftId }, { target_user_id: shift.user_id, region_code: shift.region_code });
            return result;
        });
    }
    async schedules(actor: WorkforceActor, region?: string) {
        const scope = this.scoped(actor, region);
        const rows = await this.prisma.tour_schedules.findMany({ where: {
            ...(actor.isManager ? { ...(scope === undefined ? {} : { operating_region: scope }) } : { crew: { some: { user_id: actor.userId } } }),
            end_date: { gte: new Date(Date.now() - 30 * 86400000) },
        }, select: { tour_schedule_id: true, code: true, start_date: true, end_date: true, status: true, booked_count: true, operating_region: true, operating_region_source: true, crew_locked_at: true, crew_locked_by: true, crew_revision: true, crew_snapshot: true, crew_required_count: true, cover_image_url: true,
            departure_location: { select: { name: true } }, tours: { select: { name: true, summary: true, tour_images: { select: { image_url: true }, orderBy: [{ is_cover: 'desc' }, { sort_order: 'asc' }, { image_id: 'asc' }], take: 1 } } }, crew: { include: crewInclude, orderBy: { assignment_id: 'asc' } } },
        orderBy: [{ start_date: 'asc' }, { tour_schedule_id: 'asc' }], take: 500 });
        return rows.map(row => {
            const assessment = crewReadiness(row);
            return { ...row, crew_snapshot: readCrewSnapshot(row.crew_snapshot), crew_lock_deadline: new Date(row.start_date.getTime() - CREW_LOCK_LEAD_MS).toISOString(), cover_image_url: row.cover_image_url || row.tours.tour_images[0]?.image_url || null, tours: { name: row.tours.name, summary: row.tours.summary }, crew_ready: assessment.ready, crew_confirmed_count: assessment.confirmed.length, crew_issues: assessment.issues };
        });
    }
    async setRegion(actor: WorkforceActor, scheduleId: number, value: unknown, overrideReason?: unknown) {
        if (!actor.isAdmin) throw new ForbiddenException(`${ADMIN_CONTENT_DENIED} Chỉ quản trị viên được chỉ định miền điều hành của chuyến.`);
        const region = regionCode(value);
        return this.prisma.$transaction(async tx => {
            await tx.$queryRaw`SELECT tour_schedule_id FROM tour_schedules WHERE tour_schedule_id = ${scheduleId} FOR UPDATE`;
            const schedule = await tx.tour_schedules.findUnique({ where: { tour_schedule_id: scheduleId }, include: { crew: true } });
            if (!schedule) throw new NotFoundException('Không tìm thấy chuyến.');
            const changed = schedule.operating_region !== region;
            const protectedData = Boolean(schedule.crew_locked_at || readCrewSnapshot(schedule.crew_snapshot)) || schedule.start_date.getTime() - Date.now() <= CREW_LOCK_LEAD_MS;
            const reason = text(overrideReason, 'Lý do thay đổi miền', 1000, changed && protectedData);
            await this.event(tx, actor, 'schedule_region_updated', { before: schedule.operating_region, after: region, reason }, { tour_schedule_id: scheduleId, region_code: region });
            const updated = await tx.tour_schedules.update({ where: { tour_schedule_id: scheduleId }, data: { operating_region: region, operating_region_source: 'admin', ...(changed ? { crew_locked_at: null, crew_locked_by: null } : {}) } });
            if (changed) await finalizeCrewIfReady(tx, scheduleId, actor.userId);
            return updated;
        });
    }
    async assignCrew(actor: WorkforceActor, scheduleId: number, body: CrewPayload) {
        this.access.manager(actor);
        if (!body || !Array.isArray(body.assignments) || body.assignments.some(item => !item || !Array.isArray(item.roles) || !item.roles.length || item.roles.some(role => !Object.hasOwn(CREW_ROLES, role)) || new Set(item.roles).size !== item.roles.length)) throw new BadRequestException('Mỗi phân công cần ít nhất một vai trò hợp lệ: Trưởng đoàn, Phó đoàn hoặc Hướng dẫn viên.');
        if (body.crew_required_count !== undefined && (!Number.isSafeInteger(body.crew_required_count) || body.crew_required_count < 1 || body.crew_required_count > 2147483647)) throw new BadRequestException('Số nhân sự tối thiểu phải là số nguyên từ 1 đến 2147483647.');
        const assignments = body.assignments.map(item => ({ roles: Object.keys(CREW_ROLES).filter(role => item.roles.includes(role as CrewRole)), user_id: id(item.user_id), report_at: date(item.report_at), release_at: date(item.release_at), note: text(item.note, 'Ghi chú', 1000) || null }));
        if (new Set(assignments.map(item => item.user_id)).size !== assignments.length) throw new BadRequestException('Mỗi nhân viên chỉ xuất hiện một lần; chọn các vai trò kiêm nhiệm trên cùng một dòng.');
        return this.prisma.$transaction(async tx => {
            await tx.$queryRaw`SELECT tour_schedule_id FROM tour_schedules WHERE tour_schedule_id = ${scheduleId} FOR UPDATE`;
            const schedule = await tx.tour_schedules.findUnique({ where: { tour_schedule_id: scheduleId }, include: { crew: true } });
            if (!schedule) throw new NotFoundException('Không tìm thấy chuyến.');
            if (!schedule.operating_region) {
                const inferred = await inferOperatingRegion(tx, schedule.departure_location_id);
                if (!inferred) throw new BadRequestException('Cần chọn miền điều hành trước khi phân công.');
                schedule.operating_region = inferred;
                await tx.tour_schedules.update({ where: { tour_schedule_id: scheduleId }, data: { operating_region: inferred, operating_region_source: 'departure' } });
            }
            this.access.region(actor, schedule.operating_region);
            if (schedule.start_date <= new Date()) throw new BadRequestException('Không thể thay đổi phân công của chuyến đã khởi hành.');
            const protectedData = Boolean(schedule.crew_locked_at || readCrewSnapshot(schedule.crew_snapshot)) || schedule.start_date.getTime() - Date.now() <= CREW_LOCK_LEAD_MS;
            if (protectedData && !actor.isAdmin) throw new ForbiddenException('Phân công đã chốt hoặc đã đến hạn 24 giờ trước khởi hành. Chỉ admin được sửa ngoại lệ có lý do.');
            const reason = text(body.override_reason, 'Lý do sửa phân công', 1000, protectedData);
            if (protectedData) await this.event(tx, actor, 'crew_override', { reason, previous_revision: schedule.crew_revision }, { tour_schedule_id: scheduleId, region_code: schedule.operating_region });
            await this.lockPeople(tx, [...assignments.map(item => item.user_id), ...schedule.crew.map(item => item.user_id)]);
            for (const item of assignments) {
                if (item.release_at <= item.report_at || item.report_at > schedule.start_date || item.release_at < schedule.end_date) throw new BadRequestException('Thời gian điều động phải bao gồm toàn bộ chuyến (có thể mở rộng để di chuyển và nghỉ).');
                const employee = await this.access.actor(item.user_id, undefined, tx);
                if (item.roles.some(role => !employee.roles.includes(role as CrewRole))) throw new BadRequestException('Nhân viên chưa có đủ vai trò được phân công.');
                if (!employee.regions.includes(schedule.operating_region as RegionCode) && !employee.isAdmin) throw new BadRequestException('Nhân viên chưa được cấp phạm vi hỗ trợ miền điều hành của chuyến.');
                await this.available(tx, item.user_id, item.report_at, item.release_at, scheduleId);
            }
            await tx.schedule_crew.deleteMany({ where: { tour_schedule_id: scheduleId, user_id: { notIn: assignments.map(item => item.user_id) } } });
            for (const item of assignments) {
                const old = schedule.crew.find(row => row.user_id === item.user_id);
                const unchanged = old && old.roles.length === item.roles.length && old.roles.every(role => item.roles.includes(role)) && old.report_at.getTime() === item.report_at.getTime() && old.release_at.getTime() === item.release_at.getTime();
                await tx.schedule_crew.upsert({ where: { tour_schedule_id_user_id: { tour_schedule_id: scheduleId, user_id: item.user_id } },
                    create: { ...item, tour_schedule_id: scheduleId, assigned_by: actor.userId },
                    update: { ...item, assigned_by: actor.userId, ...(!unchanged ? { status: 'pending', confirmed_at: null, response_note: null } : {}) } });
            }
            const requiredCount = body.crew_required_count ?? schedule.crew_required_count;
            await tx.tour_schedules.update({ where: { tour_schedule_id: scheduleId }, data: { crew_required_count: requiredCount, ...(protectedData ? { crew_locked_at: null, crew_locked_by: null } : {}) } });
            await this.event(tx, actor, 'crew_assigned', { before: schedule.crew, after: assignments, requirement_before: schedule.crew_required_count, requirement_after: requiredCount }, { tour_schedule_id: scheduleId, region_code: schedule.operating_region });
            await finalizeCrewIfReady(tx, scheduleId, actor.userId);
            return { success: true };
        });
    }
    async respond(actor: WorkforceActor, assignmentId: number, action: string, note?: unknown) {
        if (!['confirm', 'decline', 'complete'].includes(action)) throw new BadRequestException('Phản hồi không hợp lệ.');
        const response_note = text(note, 'Lý do', 1000, action === 'decline') || null;
        return this.prisma.$transaction(async tx => {
            const initial = await tx.schedule_crew.findUnique({ where: { assignment_id: assignmentId } });
            if (!initial) throw new NotFoundException('Phân công không còn tồn tại.');
            await tx.$queryRaw`SELECT tour_schedule_id FROM tour_schedules WHERE tour_schedule_id = ${initial.tour_schedule_id} FOR UPDATE`;
            await this.lockPeople(tx, [actor.userId]);
            const assignment = await tx.schedule_crew.findUnique({ where: { assignment_id: assignmentId }, include: { schedule: true } });
            if (!assignment || assignment.user_id !== actor.userId) throw new ForbiddenException('Chỉ người được phân công mới được phản hồi.');
            if (assignment.roles.some(role => !actor.roles.includes(role as CrewRole))) throw new ForbiddenException('Bạn không còn đủ vai trò phù hợp với phân công này.');
            this.access.region(actor, assignment.schedule.operating_region);
            if (action === 'complete' ? assignment.status !== 'confirmed' || assignment.schedule.end_date > new Date() : assignment.status !== 'pending' || assignment.schedule.end_date <= new Date()) throw new ConflictException('Trạng thái hoặc thời gian chuyến không cho phép phản hồi này.');
            const status = action === 'confirm' ? 'confirmed' : action === 'decline' ? 'declined' : 'completed';
            const result = await tx.schedule_crew.update({ where: { assignment_id: assignmentId }, data: { status, response_note, ...(action === 'confirm' ? { confirmed_at: new Date() } : {}) } });
            await this.event(tx, actor, `crew_${status}`, { assignment_id: assignmentId, response_note }, { target_user_id: actor.userId, tour_schedule_id: assignment.tour_schedule_id, region_code: assignment.schedule.operating_region });
            if (action === 'confirm') await finalizeCrewIfReady(tx, assignment.tour_schedule_id);
            return result;
        });
    }
    async overview(actor: WorkforceActor) {
        const now = new Date();
        const scope = this.scoped(actor);
        const schedules = await this.schedules(actor);
        const upcoming = schedules.filter(item => new Date(item.end_date) >= now);
        const [employees, on_duty] = await Promise.all([
            this.prisma.employee_profiles.count({ where: { status: 'active', ...(actor.isManager ? {} : { user_id: actor.userId }) } }),
            this.prisma.staff_shifts.count({ where: { duty_type: 'page', status: 'scheduled', starts_at: { lte: now }, ends_at: { gt: now }, ...(actor.isManager ? { ...(scope === undefined ? {} : { region_code: scope }) } : { user_id: actor.userId }) } }),
        ]);
        return { employees, on_duty, upcoming: upcoming.length, missing_crew: upcoming.filter(item => !item.crew_ready).length };
    }
    async events(actor: WorkforceActor, scheduleId?: number) {
        this.access.manager(actor);
        return this.prisma.workforce_events.findMany({ where: { ...(scheduleId ? { tour_schedule_id: scheduleId } : {}) }, orderBy: { created_at: 'desc' }, take: 100 });
    }
}
