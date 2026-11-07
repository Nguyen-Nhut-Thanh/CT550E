"use client";
import { useRef, useState } from 'react';
import { AdminModalShell } from '@/components/admin/common/AdminModalShell';
import { AdminPagination } from '@/components/admin/common/AdminPagination';
import { workforceApi, workforceDate } from '@/lib/admin/workforce/api';
import { filterWorkforceTrips, getWorkforceTripStatus, WORKFORCE_TRIP_STATUSES, type WorkforceTripFilter } from '@/lib/admin/workforce/trips';
import { type CrewPayload, type Employee, type WorkforceActor, type WorkforceSchedule } from 'shared';
import { CrewEditor } from './CrewEditor';
import { CrewScheduleCard, requiresCrewOverride } from './CrewScheduleCard';

export function CrewPanel({ actor, schedules, employees, busy, onRegion, onAssign, onRespond, onlyMine = false, initialStatusFilter = 'upcoming' }: {
  actor: WorkforceActor; schedules: WorkforceSchedule[]; employees: Employee[]; busy: boolean; onlyMine?: boolean;
  initialStatusFilter?: 'upcoming' | 'all';
  onRegion: (id: number, region: string, reason?: string) => Promise<void>; onAssign: (id: number, body: CrewPayload) => Promise<boolean>; onRespond: (id: number, action: string, note?: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState<WorkforceSchedule | null>(null);
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
  const overdue = matchingTrips.filter(schedule => !schedule.crew_locked_at && Date.parse(schedule.start_date) > now && Date.parse(schedule.start_date) - now <= 86400_000);
  const filters: Array<{ value: WorkforceTripFilter; label: string }> = [
    { value: 'upcoming', label: 'Sắp khởi hành' },
    { value: 'ongoing', label: 'Đang diễn ra' },
    { value: 'completed', label: 'Đã kết thúc' },
    { value: 'all', label: 'Tất cả' },
  ];
  return <div ref={listRef} className="space-y-4">
    {actor.isManager && !onlyMine && overdue.length > 0 && <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50/60 px-4 py-3 text-xs leading-5 text-rose-700">Có {overdue.length} chuyến khởi hành trong 24 giờ chưa chốt nhân sự. Cần admin xử lý ngoại lệ; hệ thống sẽ thông báo cho khách khi danh sách được xác nhận đầy đủ.</p>}
    <div className="space-y-4 rounded-2xl border border-blue-100 bg-white p-4">
      <div role="group" aria-label="Lọc chuyến theo thời gian" className="flex flex-wrap gap-2">{filters.map(filter => <button key={filter.value} type="button" aria-pressed={statusFilter === filter.value} onClick={() => { setStatusFilter(filter.value); setPage(1); }} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-[650] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${statusFilter === filter.value ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}>{filter.label}<span className={`rounded-full px-2 py-0.5 text-xs ${statusFilter === filter.value ? 'bg-white/20' : 'bg-white text-slate-500'}`}>{counts[filter.value]}</span></button>)}</div>
      <div className="flex flex-wrap items-center gap-4"><input aria-label="Tìm chuyến" className="min-w-0 w-full flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm sm:min-w-48" placeholder="Tìm tour, mã chuyến hoặc nơi xuất phát…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />{!onlyMine && <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={missing} onChange={e => { setMissing(e.target.checked); setPage(1); }} />Chưa đủ nhân sự xác nhận</label>}</div>
      {(statusFilter === 'completed' || statusFilter === 'all') && <p className="text-xs text-slate-500">Lịch sử gồm các chuyến kết thúc trong 30 ngày gần nhất.</p>}
    </div>
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white">
      <div className="divide-y divide-blue-300">
        {!rows.length && <div className="p-12 text-center text-sm text-slate-500">Không có chuyến phù hợp với bộ lọc hiện tại.</div>}
    {visibleRows.map(schedule => <CrewScheduleCard key={schedule.tour_schedule_id} actor={actor} schedule={schedule} busy={busy} onlyMine={onlyMine} onEdit={() => setEditing(schedule)} onRegion={onRegion} onRespond={onRespond} onDecline={id => { setDeclining(id); setReason(''); }} onHistory={() => { setHistory([]); setHistoryError(''); void workforceApi.events(schedule.tour_schedule_id).then(setHistory).catch(error => setHistoryError(error.message)); }} />)}
      </div>
      <div className="border-t border-blue-100"><AdminPagination variant="numbered" showSinglePage currentPage={currentPage} totalPages={totalPages} totalItems={rows.length} pageSize={pageSize} itemLabel="chuyến" onPageChange={nextPage => { setPage(nextPage); listRef.current?.scrollIntoView({ block: 'start' }); }} /></div>
    </div>
    {editing && <CrewEditor requireOverride={requiresCrewOverride(editing)} key={editing.tour_schedule_id} schedule={editing} employees={employees} busy={busy} onClose={() => setEditing(null)} onSave={async body => { if (await onAssign(editing.tour_schedule_id, body)) setEditing(null); }} />}
    {declining && <AdminModalShell title="Từ chối chuyến được giao" onClose={() => !busy && setDeclining(null)}><form className="space-y-4 p-6" onSubmit={e => { e.preventDefault(); void onRespond(declining, 'decline', reason).then(ok => { if (ok) setDeclining(null); }); }}><label className="block text-sm text-slate-600">Lý do<textarea required maxLength={1000} rows={3} className="mt-2 w-full rounded-xl border p-3" value={reason} onChange={e => setReason(e.target.value)} /></label><button disabled={busy} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-[650] text-white">Gửi phản hồi</button></form></AdminModalShell>}
    {history && <AdminModalShell title="Lịch sử điều hành chuyến" onClose={() => setHistory(null)}><div className="space-y-3 p-6">{historyError && <p role="alert" className="text-sm text-rose-600">{historyError}</p>}{!history.length && !historyError && <p className="text-sm text-slate-400">Chưa có thay đổi được ghi nhận.</p>}{history.map(event => <div key={event.event_id} className="rounded-xl bg-slate-50 p-3 text-sm"><p className="font-semibold">{{ crew_assigned: 'Cập nhật đội ngũ phụ trách', crew_confirmed: 'Nhân viên nhận chuyến', crew_declined: 'Nhân viên từ chối chuyến', crew_completed: 'Nhân viên hoàn thành chuyến', crew_finalized: 'Tự chốt / công bố nhân sự', crew_override: 'Admin sửa ngoại lệ phân công', schedule_region_updated: 'Chỉ định miền điều hành' }[event.action] || 'Cập nhật điều hành'}</p><p className="mt-1 text-xs text-slate-500">{event.actor_user_id === 0 ? 'Hệ thống' : employees.find(item => item.user_id === event.actor_user_id)?.full_name || 'Nhân viên phụ trách'} · {workforceDate(event.created_at)}</p>{event.details !== null && typeof event.details === 'object' && 'reason' in event.details && typeof event.details.reason === 'string' && event.details.reason && <p className="mt-2 text-xs leading-5 text-slate-600">Lý do: {event.details.reason}</p>}</div>)}</div></AdminModalShell>}
  </div>;
}
