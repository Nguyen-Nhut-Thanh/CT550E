"use client";
import { useRef, useState } from 'react';
import { AdminModalShell } from '@/components/admin/common/AdminModalShell';
import { AdminPagination } from '@/components/admin/common/AdminPagination';
import CustomDropdown from '@/components/common/forms/CustomDropdown';
import { workforceApi, workforceDate } from '@/lib/admin/workforce/api';
import { filterWorkforceTrips, getWorkforceTripStatus, WORKFORCE_TRIP_STATUSES, type WorkforceTripFilter } from '@/lib/admin/workforce/trips';
import { CREW_ROLES, WORKFORCE_REGIONS, type CrewPayload, type CrewRole, type Employee, type WorkforceActor, type WorkforceSchedule } from 'shared';
import { History } from 'lucide-react';
import Link from 'next/link';
import { CrewEditor } from './CrewEditor';

const statuses: Record<string, string> = { pending: 'Chờ xác nhận', confirmed: 'Đã nhận chuyến', declined: 'Đã từ chối', completed: 'Hoàn thành' };
const roleRank = (roles: CrewRole[]) => (Object.keys(CREW_ROLES) as CrewRole[]).findIndex(role => roles.includes(role));
export function CrewPanel({ actor, schedules, employees, busy, onRegion, onAssign, onRespond, onlyMine = false, initialStatusFilter = 'upcoming' }: {
  actor: WorkforceActor; schedules: WorkforceSchedule[]; employees: Employee[]; busy: boolean; onlyMine?: boolean;
  initialStatusFilter?: 'upcoming' | 'all';
  onRegion: (id: number, region: string) => Promise<void>; onAssign: (id: number, body: CrewPayload) => Promise<boolean>; onRespond: (id: number, action: string, note?: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState<WorkforceSchedule | null>(null);
  const [regionEdits, setRegionEdits] = useState<Record<number, string>>({});
  const [search, setSearch] = useState('');
  const [missing, setMissing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<WorkforceTripFilter>(initialStatusFilter);
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);
  const [declining, setDeclining] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [history, setHistory] = useState<Awaited<ReturnType<typeof workforceApi.events>> | null>(null);
  const [historyError, setHistoryError] = useState('');
  const now = Date.now();
  const pageSize = 10;
  const baseFilters = { search, missingCrew: missing, userId: onlyMine ? actor.userId : undefined };
  const matchingTrips = filterWorkforceTrips(schedules, { ...baseFilters, status: 'all' }, now);
  const counts = { all: matchingTrips.length, upcoming: 0, ongoing: 0, completed: 0 };
  matchingTrips.forEach(schedule => { counts[getWorkforceTripStatus(schedule, now)] += 1; });
  const rows = statusFilter === 'all' ? matchingTrips : matchingTrips.filter(schedule => getWorkforceTripStatus(schedule, now) === statusFilter);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const filters: Array<{ value: WorkforceTripFilter; label: string }> = [
    { value: 'upcoming', label: 'Sắp khởi hành' },
    { value: 'ongoing', label: 'Đang diễn ra' },
    { value: 'completed', label: 'Đã kết thúc' },
    { value: 'all', label: 'Tất cả' },
  ];
  return <div ref={listRef} className="space-y-4">
    <div className="space-y-4 rounded-2xl border border-blue-100 bg-white p-4">
      <div role="group" aria-label="Lọc chuyến theo thời gian" className="flex flex-wrap gap-2">{filters.map(filter => <button key={filter.value} type="button" aria-pressed={statusFilter === filter.value} onClick={() => { setStatusFilter(filter.value); setPage(1); }} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-[650] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${statusFilter === filter.value ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}>{filter.label}<span className={`rounded-full px-2 py-0.5 text-xs ${statusFilter === filter.value ? 'bg-white/20' : 'bg-white text-slate-500'}`}>{counts[filter.value]}</span></button>)}</div>
      <div className="flex flex-wrap items-center gap-4"><input aria-label="Tìm chuyến" className="min-w-0 w-full flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm sm:min-w-48" placeholder="Tìm tour, mã chuyến hoặc nơi xuất phát…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />{!onlyMine && <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={missing} onChange={e => { setMissing(e.target.checked); setPage(1); }} />Chưa đủ nhân sự xác nhận</label>}</div>
      {(statusFilter === 'completed' || statusFilter === 'all') && <p className="text-xs text-slate-500">Lịch sử gồm các chuyến kết thúc trong 30 ngày gần nhất.</p>}
    </div>
    {!rows.length && <div className="rounded-2xl border border-blue-100 bg-white p-12 text-center text-sm text-slate-500">Không có chuyến phù hợp với bộ lọc hiện tại.</div>}
    {visibleRows.map(schedule => { const past = new Date(schedule.start_date).getTime() <= now; const tripStatus = WORKFORCE_TRIP_STATUSES[getWorkforceTripStatus(schedule, now)]; return <section key={schedule.tour_schedule_id} className="overflow-hidden rounded-2xl border border-blue-100 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5"><div><p className="text-xs font-semibold text-blue-600">{schedule.code || `Chuyến ${schedule.tour_schedule_id}`}</p><h2 className="mt-1 text-base font-[750] text-slate-900">{schedule.tours.name}</h2><p className="mt-2 text-xs text-slate-500">{workforceDate(schedule.start_date)} → {workforceDate(schedule.end_date)}</p><p className="mt-1 text-xs text-slate-500">Xuất phát: {schedule.departure_location.name} · {schedule.booked_count} khách giữ chỗ</p></div>
        <div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1.5 text-xs font-[650] ${tripStatus.className}`}>{tripStatus.label}</span><span className={`rounded-full px-3 py-1.5 text-xs font-[650] ${schedule.crew_ready ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{schedule.crew_ready ? 'Đủ nhân sự xác nhận' : 'Chưa đủ nhân sự xác nhận'}</span></div></div>
      <div className="space-y-4 p-5"><div className="flex flex-wrap items-center gap-3 text-sm"><span className="font-semibold text-slate-600">Miền điều hành:</span>
        {actor.isAdmin && !past && !onlyMine ? <>
          <CustomDropdown ariaLabel={`Miền điều hành ${schedule.code || schedule.tour_schedule_id}`} variant="compact" matchTriggerWidth
            className="w-full sm:w-52 [&_button[aria-haspopup]]:min-w-0" selectedValue={regionEdits[schedule.tour_schedule_id] ?? schedule.operating_region ?? ''}
            onSelect={value => setRegionEdits(prev => ({ ...prev, [schedule.tour_schedule_id]: value }))}
            options={[{ value: '', label: 'Chưa chọn miền' }, ...Object.entries(WORKFORCE_REGIONS).map(([value, label]) => ({ value, label }))]} />
          <button disabled={busy || !regionEdits[schedule.tour_schedule_id] || regionEdits[schedule.tour_schedule_id] === schedule.operating_region} onClick={() => void onRegion(schedule.tour_schedule_id, regionEdits[schedule.tour_schedule_id])} className="font-semibold text-blue-600 disabled:text-slate-300">Lưu miền</button>
        </> : <span>{schedule.operating_region ? WORKFORCE_REGIONS[schedule.operating_region] : 'Chưa chỉ định'}</span>}
      </div>
      <p className="text-xs font-semibold text-slate-600">{schedule.crew.length} người được phân công · Tối thiểu {schedule.crew_required_count} người · {schedule.crew_confirmed_count} người đã nhận chuyến hợp lệ</p>
      {!!schedule.crew_issues.length && <ul className="list-inside list-disc space-y-1 text-xs text-amber-700">{schedule.crew_issues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
      {!schedule.crew.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa phân công nhân sự cho chuyến này.</p>}
      <div className="grid gap-3 md:grid-cols-2">{[...schedule.crew].sort((a, b) => roleRank(a.roles) - roleRank(b.roles)).map(member => { return <div key={member.assignment_id} className="rounded-xl border border-slate-100 bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">{Object.keys(CREW_ROLES).filter(role => member.roles.includes(role as CrewRole)).map(role => CREW_ROLES[role as CrewRole]).join(' kiêm ')}</p><p className="mt-2 text-sm font-bold text-slate-800">{member?.user.full_name || 'Chưa phân công'}</p>{member && <><p className="mt-1 text-xs text-blue-700">{statuses[member.status]}</p><p className="mt-2 text-xs text-slate-500">Điều động: {workforceDate(member.report_at)} → {workforceDate(member.release_at)}</p>{member.note && <p className="mt-2 text-xs text-slate-600">{member.note}</p>}{member.response_note && <p className="mt-2 text-xs text-amber-700">Phản hồi: {member.response_note}</p>}
        {member.user_id === actor.userId && <div className="mt-3 flex gap-4">{member.status === 'pending' && new Date(schedule.end_date).getTime() > Date.now() && <><button disabled={busy} onClick={() => void onRespond(member.assignment_id, 'confirm')} className="text-xs font-[650] text-emerald-700">Nhận chuyến</button><button disabled={busy} onClick={() => { setDeclining(member.assignment_id); setReason(''); }} className="text-xs font-[650] text-rose-600">Từ chối</button></>}{member.status === 'confirmed' && new Date(schedule.end_date).getTime() <= Date.now() && <button disabled={busy} onClick={() => void onRespond(member.assignment_id, 'complete')} className="text-xs font-[650] text-blue-600">Xác nhận hoàn thành</button>}</div>}</>}
      </div>; })}</div>
      {actor.isManager && !onlyMine && <>{(past || !schedule.operating_region) && <p className="text-xs text-amber-700">{past ? 'Chuyến đã khởi hành, không thể thay đổi phân công.' : actor.isAdmin ? 'Chọn và lưu miền điều hành trước khi phân công nhân sự.' : 'Cần quản trị viên chỉ định miền điều hành trước khi phân công.'}</p>}<div className="flex flex-wrap items-center gap-4"><button disabled={busy || past || !schedule.operating_region} onClick={() => setEditing(schedule)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-[650] text-white disabled:opacity-40">Phân công / thay người</button><button onClick={() => { setHistory([]); setHistoryError(''); void workforceApi.events(schedule.tour_schedule_id).then(setHistory).catch(e => setHistoryError(e.message)); }} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"><History size={15} />Lịch sử thay đổi</button>{actor.isAdmin && <Link href={`/admin/schedules/${schedule.tour_schedule_id}`} className="text-xs font-semibold text-blue-600">Chi tiết lịch khởi hành</Link>}</div></>}
      </div>
    </section>; })}
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white"><AdminPagination variant="numbered" showSinglePage currentPage={currentPage} totalPages={totalPages} totalItems={rows.length} pageSize={pageSize} itemLabel="chuyến" onPageChange={nextPage => { setPage(nextPage); listRef.current?.scrollIntoView({ block: 'start' }); }} /></div>
    {editing && <CrewEditor key={editing.tour_schedule_id} schedule={editing} employees={employees} busy={busy} onClose={() => setEditing(null)} onSave={async body => { if (await onAssign(editing.tour_schedule_id, body)) setEditing(null); }} />}
    {declining && <AdminModalShell title="Từ chối chuyến được giao" onClose={() => !busy && setDeclining(null)}><form className="space-y-4 p-6" onSubmit={e => { e.preventDefault(); void onRespond(declining, 'decline', reason).then(ok => { if (ok) setDeclining(null); }); }}><label className="block text-sm text-slate-600">Lý do<textarea required maxLength={1000} rows={3} className="mt-2 w-full rounded-xl border p-3" value={reason} onChange={e => setReason(e.target.value)} /></label><button disabled={busy} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-[650] text-white">Gửi phản hồi</button></form></AdminModalShell>}
    {history && <AdminModalShell title="Lịch sử điều hành chuyến" onClose={() => setHistory(null)}><div className="space-y-3 p-6">{historyError && <p role="alert" className="text-sm text-rose-600">{historyError}</p>}{!history.length && !historyError && <p className="text-sm text-slate-400">Chưa có thay đổi được ghi nhận.</p>}{history.map(event => <div key={event.event_id} className="rounded-xl bg-slate-50 p-3 text-sm"><p className="font-semibold">{{ crew_assigned: 'Cập nhật đội ngũ phụ trách', crew_confirmed: 'Nhân viên nhận chuyến', crew_declined: 'Nhân viên từ chối chuyến', crew_completed: 'Nhân viên hoàn thành chuyến', schedule_region_updated: 'Chỉ định miền điều hành' }[event.action] || 'Cập nhật điều hành'}</p><p className="mt-1 text-xs text-slate-500">{employees.find(item => item.user_id === event.actor_user_id)?.full_name || 'Nhân viên phụ trách'} · {workforceDate(event.created_at)}</p></div>)}</div></AdminModalShell>}
  </div>;
}
