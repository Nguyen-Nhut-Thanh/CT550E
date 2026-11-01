"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWorkforceIdentity } from '@/components/admin/layout/AdminGuard';
import { EmployeeEditor } from '@/components/admin/workforce/EmployeeEditor';
import { ShiftPanel } from '@/components/admin/workforce/ShiftPanel';
import { CrewPanel } from '@/components/admin/workforce/CrewPanel';
import { WorkforcePageHeader } from '@/components/admin/workforce/WorkforcePageHeader';
import { WorkforceOverviewPanel, type WorkforceNavigation, type WorkforceSection } from '@/components/admin/workforce/WorkforceOverviewPanel';
import CustomDropdown from '@/components/common/forms/CustomDropdown';
import { workforceApi } from '@/lib/admin/workforce/api';
import { useToast } from '@/lib/notifications/useToast';
import { WORKFORCE_REGIONS, WORKFORCE_ROLES, type Employee, type RegionCode, type StaffShift, type WorkforceSchedule } from 'shared';
import { ArrowLeft, BriefcaseBusiness, CalendarDays, Headset, LayoutDashboard, Plus, UsersRound } from 'lucide-react';

export default function WorkforcePage() {
  return <Suspense fallback={<div className="p-8 text-sm text-slate-500">Đang tải nhân sự & điều hành…</div>}><WorkforceContent /></Suspense>;
}

function WorkforceContent() {
  const actor = useWorkforceIdentity();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<WorkforceSection>('overview');
  const [region, setRegion] = useState('');
  const [scheduleId, setScheduleId] = useState<number | undefined>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [schedules, setSchedules] = useState<WorkforceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Employee | null | undefined>(undefined);
  const toast = useToast();
  const requestSequence = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!actor) return;
    const readNavigation = () => {
      const params = searchParams;
      const requested = params.get('tab') || 'overview';
      const allowed = actor.isManager ? ['overview', 'employees', 'shifts', 'trips', 'mine'] : ['overview', 'shifts', 'mine'];
      const nextTab = allowed.includes(requested) ? requested as WorkforceSection : 'overview';
      const requestedRegion = params.get('region') || '';
      const allowedRegion = Object.hasOwn(WORKFORCE_REGIONS, requestedRegion) && (actor.isAdmin || actor.regions.includes(requestedRegion as RegionCode));
      const requestedSchedule = Number(params.get('schedule'));
      setTab(nextTab);
      setRegion(nextTab === 'overview' || !allowedRegion ? '' : requestedRegion);
      setScheduleId(['trips', 'mine'].includes(nextTab) && Number.isSafeInteger(requestedSchedule) && requestedSchedule > 0 ? requestedSchedule : undefined);
    };
    readNavigation();
  }, [actor, searchParams]);
  const load = useCallback(async () => {
    if (!actor) return;
    const sequence = ++requestSequence.current;
    setLoading(true); setError('');
    try {
      const scopeRegion = tab === 'overview' ? '' : region;
      const [people, work, trips] = await Promise.all([actor.isManager ? workforceApi.employees() : Promise.resolve([]), workforceApi.shifts(scopeRegion), workforceApi.schedules(scopeRegion)]);
      if (sequence !== requestSequence.current) return;
      setEmployees(people); setShifts(work); setSchedules(trips);
    } catch (e) { if (sequence === requestSequence.current) setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu nhân sự.'); }
    finally { if (sequence === requestSequence.current) setLoading(false); }
  }, [actor, region, tab]);
  useEffect(() => { void load(); }, [load]);
  async function mutate(action: () => Promise<unknown>, message: string) {
    if (busy) return false;
    setBusy(true);
    try { await action(); toast.success(message); await load(); return true; }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Không thể lưu thay đổi.'); return false; }
    finally { setBusy(false); }
  }
  function navigate(section: WorkforceSection, options: WorkforceNavigation = {}) {
    const nextRegion = section === 'overview' ? '' : options.region ?? region;
    const nextSchedule = ['trips', 'mine'].includes(section) ? options.scheduleId : undefined;
    setTab(section); setRegion(nextRegion); setScheduleId(nextSchedule);
    const params = new URLSearchParams();
    if (section !== 'overview') params.set('tab', section);
    if (nextRegion) params.set('region', nextRegion);
    if (nextSchedule) params.set('schedule', String(nextSchedule));
    const target = `/admin/workforce${params.size ? `?${params}` : ''}`;
    if (`${window.location.pathname}${window.location.search}` !== target) window.history.pushState(null, '', target);
    contentRef.current?.closest('main')?.scrollTo({ top: 0 });
  }
  if (!actor) return null;
  const tabs: Array<{ id: WorkforceSection; label: string; icon: typeof UsersRound }> = [{ id: 'overview', label: 'Tổng quan', icon: LayoutDashboard }, ...(actor.isManager ? [{ id: 'employees' as const, label: 'Nhân viên', icon: UsersRound }, { id: 'trips' as const, label: 'Điều hành chuyến', icon: BriefcaseBusiness }] : []), { id: 'shifts', label: actor.isManager ? 'Ca trực & lịch nghỉ' : 'Ca làm của tôi', icon: Headset }, { id: 'mine', label: 'Chuyến của tôi', icon: CalendarDays }];
  const selectedSchedule = schedules.find(schedule => schedule.tour_schedule_id === scheduleId);
  const visibleSchedules = scheduleId ? schedules.filter(schedule => schedule.tour_schedule_id === scheduleId) : schedules;
  const visibleEmployees = employees.filter(employee => (!region || employee.regions.includes(region as RegionCode)) && `${employee.full_name} ${employee.employee_code} ${employee.email}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));
  return <div ref={contentRef} className="relative min-w-0 space-y-3 font-sans text-sm leading-normal tracking-normal">
    <WorkforcePageHeader actor={actor} loading={loading} onNavigate={navigate} onRefresh={() => void load()} />
    <div className="relative z-10 flex flex-wrap items-center justify-between gap-3"><div className="flex max-w-full gap-1 overflow-x-auto rounded-[14px] border border-blue-100/80 bg-white/95 p-1 shadow-[0_3px_14px_#4d9bff05]" role="tablist" aria-label="Quản lý nhân sự">{tabs.map(item => <button key={item.id} id={`workforce-tab-${item.id}`} role="tab" aria-selected={tab === item.id} aria-controls={`workforce-panel-${item.id}`} onClick={() => navigate(item.id)} className={`inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-[650] transition ${tab === item.id ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-[0_4px_10px_#075bff20]' : 'text-[#5d7299] hover:bg-blue-50 hover:text-blue-600'}`}><item.icon size={18} />{item.label}</button>)}</div>
      {actor.isManager && tab !== 'overview' && <CustomDropdown ariaLabel="Lọc theo miền điều hành" variant="compact" matchTriggerWidth
        className="w-full sm:w-64 [&_button[aria-haspopup]]:min-w-0" selectedValue={region} onSelect={value => navigate(tab, { region: value })}
        options={[{ value: '', label: actor.isAdmin ? 'Tất cả miền / chưa chỉ định' : 'Các miền được quản lý' }, ...Object.entries(WORKFORCE_REGIONS).filter(([code]) => actor.isAdmin || actor.regions.includes(code as RegionCode)).map(([value, label]) => ({ value, label }))]} />}
    </div>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}<button onClick={() => void load()} className="ml-3 underline">Thử lại</button></div>}
    <div role="tabpanel" id={`workforce-panel-${tab}`} aria-labelledby={`workforce-tab-${tab}`}>
    {tab === 'overview' && !error && <WorkforceOverviewPanel actor={actor} employees={employees} shifts={shifts} schedules={schedules} loading={loading} onNavigate={navigate} />}
    {scheduleId && (tab === 'trips' || tab === 'mine') && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-white p-4"><p className="min-w-0 text-sm font-semibold text-slate-700">Đang xem: {selectedSchedule?.tours.name || `Chuyến ${scheduleId}`}</p><button type="button" onClick={() => navigate(tab)} className="inline-flex items-center gap-1.5 text-xs font-[650] text-blue-600"><ArrowLeft size={14} />Xem tất cả chuyến</button></div>}
    {tab === 'employees' && actor.isManager && <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white"><div className="flex flex-wrap justify-between gap-3 border-b border-slate-100 p-4"><input aria-label="Tìm nhân viên" placeholder="Tìm tên, mã nhân viên hoặc email…" value={search} onChange={e => setSearch(e.target.value)} className="min-w-48 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /><button onClick={() => setEditing(null)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-[650] text-white"><Plus size={17} />Thêm nhân viên</button></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500"><tr>{['Nhân viên', 'Vai trò', 'Miền phụ trách', 'Trạng thái', ''].map((label, index) => <th key={index} className="p-4">{label}</th>)}</tr></thead><tbody>{visibleEmployees.map(employee => <tr key={employee.user_id} className="border-t border-slate-100"><td className="p-4"><p className="font-bold text-slate-800">{employee.full_name}</p><p className="mt-1 text-xs text-slate-500">{employee.employee_code} · {employee.position}</p><p className="mt-1 text-xs text-slate-500">{employee.email}</p></td><td className="p-4"><div className="flex max-w-xs flex-wrap gap-1.5">{employee.roles.map(role => <span key={role} className="rounded-lg bg-blue-50 px-2 py-1 text-xs text-blue-700">{WORKFORCE_ROLES[role]}</span>)}</div></td><td className="p-4 text-xs text-slate-600">{employee.regions.length ? employee.regions.map(code => WORKFORCE_REGIONS[code]).join(' · ') : 'Toàn quốc'}{employee.primary_region && <p className="mt-1 text-slate-400">Chính: {WORKFORCE_REGIONS[employee.primary_region]}</p>}</td><td className="p-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${employee.status === 'active' && employee.account_status === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{employee.account_status !== 1 ? 'Tài khoản bị khóa' : employee.status === 'active' ? 'Đang làm việc' : 'Ngưng hoạt động'}</span></td><td className="p-4">{(actor.isAdmin || (!employee.roles.some(role => ['admin', 'region_manager'].includes(role)) && employee.regions.every(code => actor.regions.includes(code)))) && <button onClick={() => setEditing(employee)} className="text-sm font-semibold text-blue-600">Chỉnh sửa</button>}</td></tr>)}{!visibleEmployees.length && <tr><td colSpan={5} className="p-10 text-center text-slate-400">{loading ? 'Đang tải nhân viên…' : 'Chưa có nhân viên phù hợp.'}</td></tr>}</tbody></table></div></section>}
    {tab === 'shifts' && <ShiftPanel actor={actor} employees={employees} shifts={shifts} busy={busy} onCreate={async body => { await mutate(() => workforceApi.createShift(body), 'Đã thêm lịch làm việc.'); }} onCancel={async id => { await mutate(() => workforceApi.cancelShift(id), 'Đã hủy lịch.'); }} />}
    {(tab === 'trips' || tab === 'mine') && <CrewPanel key={`${tab}:${region}:${scheduleId ?? 'all'}`} initialStatusFilter={scheduleId || tab === 'mine' ? 'all' : 'upcoming'} actor={actor} schedules={visibleSchedules} employees={employees} busy={busy} onlyMine={tab === 'mine'} onRegion={async (id, code) => { await mutate(() => workforceApi.setRegion(id, code), 'Đã chọn miền điều hành.'); }} onAssign={(id, body) => mutate(() => workforceApi.crew(id, body), 'Đã lưu phân công. Nhân viên có thể xác nhận chuyến.')} onRespond={(id, action, note) => mutate(() => workforceApi.respond(id, action, note), 'Đã lưu phản hồi.')} />}
    </div>
    {editing !== undefined && <EmployeeEditor key={editing?.user_id || 'new'} employee={editing} actor={actor} busy={busy} onClose={() => setEditing(undefined)} onSave={async body => { if (await mutate(() => workforceApi.saveEmployee(editing?.user_id || null, body), 'Đã lưu hồ sơ nhân viên.')) setEditing(undefined); }} />}
  </div>;
}
