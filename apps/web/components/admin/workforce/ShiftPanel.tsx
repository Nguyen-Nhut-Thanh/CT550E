"use client";
import { useState } from 'react';
import { WORKFORCE_REGIONS, type Employee, type RegionCode, type StaffShift, type StaffShiftPayload, type WorkforceActor } from 'shared';
import { fromVietnamInput, workforceDate } from '@/lib/admin/workforce/api';
import CustomDropdown from '@/components/common/forms/CustomDropdown';
import { DateTimeInput } from '@/components/common/date-time/DateTimeInput';
import { formatLocalDateTime } from '@/lib/utils/dateTime';

export function ShiftPanel({ actor, employees, shifts, busy, onCreate, onCancel }: {
  actor: WorkforceActor; employees: Employee[]; shifts: StaffShift[]; busy: boolean;
  onCreate: (body: StaffShiftPayload) => Promise<void>; onCancel: (id: number) => Promise<void>;
}) {
  const [form, setForm] = useState({ user_id: '', duty_type: 'page', region_code: actor.regions[0] || 'south', starts_at: '', ends_at: '', note: '' });
  const input = 'mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-normal';
  const dropdownClass = 'min-w-0 [&_label]:mb-1 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_button[aria-haspopup]]:min-w-0 [&_button[aria-haspopup]]:bg-white [&_button[aria-haspopup]]:py-2.5';
  const [employeeError, setEmployeeError] = useState('');
  const [timeErrors, setTimeErrors] = useState({ start: '', end: '' });
  const [filter, setFilter] = useState('upcoming');
  const active = employees.filter(employee => employee.status === 'active' && employee.account_status === 1 && (form.duty_type === 'leave' || employee.roles.includes('page_staff')) && (employee.roles.includes('admin') || employee.regions.includes(form.region_code as RegionCode)));
  const rows = shifts.filter(shift => filter === 'all' || (shift.status !== 'cancelled' && new Date(shift.ends_at).getTime() > Date.now()));
  return <div className="space-y-5">
    {actor.isManager && <form className="space-y-4 rounded-2xl border border-blue-100 bg-white p-5" onSubmit={e => {
      e.preventDefault();
      if (busy) return;
      const start = form.starts_at ? new Date(form.starts_at) : null;
      const end = form.ends_at ? new Date(form.ends_at) : null;
      const errors = {
        start: !start || !Number.isFinite(start.getTime()) ? 'Vui lòng chọn thời điểm bắt đầu.' : '',
        end: !end || !Number.isFinite(end.getTime()) ? 'Vui lòng chọn thời điểm kết thúc.'
          : start && end <= start ? 'Thời điểm kết thúc phải sau thời điểm bắt đầu.' : '',
      };
      const employeeValid = active.some(employee => String(employee.user_id) === form.user_id);
      setTimeErrors(errors);
      setEmployeeError(employeeValid ? '' : 'Vui lòng chọn nhân viên phù hợp với loại lịch và miền.');
      if (!employeeValid || errors.start || errors.end) return;
      void onCreate({ ...form, user_id: Number(form.user_id), duty_type: form.duty_type as 'page' | 'leave', region_code: form.region_code as RegionCode, starts_at: fromVietnamInput(form.starts_at), ends_at: fromVietnamInput(form.ends_at) }).then(() => setForm(prev => ({ ...prev, note: '' })));
    }}>
      <div><h2 className="text-base font-[750] text-slate-900">Xếp ca trực & lịch nghỉ</h2><p className="mt-1 text-xs text-slate-500">Giờ Việt Nam. Hệ thống kiểm tra trùng lịch trực, nghỉ và thời gian điều động đi tour.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CustomDropdown label="Loại lịch" variant="compact" matchTriggerWidth className={dropdownClass} selectedValue={form.duty_type}
          onSelect={value => { setForm({ ...form, duty_type: value, user_id: '' }); setEmployeeError(''); }}
          options={[{ value: 'page', label: 'Trực page' }, { value: 'leave', label: 'Nghỉ / không sẵn sàng' }]} />
        <CustomDropdown label="Miền" variant="compact" matchTriggerWidth className={dropdownClass} selectedValue={form.region_code}
          onSelect={value => { setForm({ ...form, region_code: value as RegionCode, user_id: '' }); setEmployeeError(''); }}
          options={Object.entries(WORKFORCE_REGIONS).filter(([code]) => actor.isAdmin || actor.regions.includes(code as RegionCode)).map(([value, label]) => ({ value, label }))} />
        <div><CustomDropdown label="Nhân viên" variant="compact" matchTriggerWidth className={dropdownClass} selectedValue={form.user_id}
          onSelect={value => { setForm({ ...form, user_id: value }); setEmployeeError(''); }}
          options={[{ value: '', label: 'Chọn nhân viên' }, ...active.map(employee => ({ value: String(employee.user_id), label: `${employee.full_name} · ${employee.employee_code}` }))]} />
          {employeeError && <p role="alert" className="mt-1 text-xs text-rose-600">{employeeError}</p>}</div>
        <DateTimeInput label="Bắt đầu" value={form.starts_at ? new Date(form.starts_at) : null} disabled={busy} error={timeErrors.start}
          onChange={date => {
            const starts_at = date ? formatLocalDateTime(date) : '';
            setForm(previous => ({ ...previous, starts_at, ends_at: starts_at && previous.ends_at && previous.ends_at <= starts_at ? '' : previous.ends_at }));
            setTimeErrors({ start: '', end: '' });
          }} />
        <DateTimeInput label="Kết thúc" value={form.ends_at ? new Date(form.ends_at) : null} disabled={busy} error={timeErrors.end}
          minDate={form.starts_at ? new Date(new Date(form.starts_at).getTime() + 60_000) : undefined}
          onChange={date => { setForm(previous => ({ ...previous, ends_at: date ? formatLocalDateTime(date) : '' })); setTimeErrors(previous => ({ ...previous, end: '' })); }} />
        <label className="text-xs font-semibold text-slate-600">Ghi chú<input maxLength={1000} className={input} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></label>
      </div><button disabled={busy} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-[650] text-white disabled:opacity-50">Thêm lịch</button>
    </form>}
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><h2 className="text-base font-[750]">{actor.isManager ? 'Danh sách ca trực & lịch nghỉ' : 'Lịch làm việc của tôi'}</h2>
        <CustomDropdown ariaLabel="Lọc lịch làm việc" variant="compact" matchTriggerWidth selectedValue={filter} onSelect={setFilter}
          className="w-full sm:w-64 [&_button[aria-haspopup]]:min-w-0" options={[{ value: 'upcoming', label: 'Đang diễn ra / sắp tới' }, { value: 'all', label: 'Tất cả (gồm lịch sử 30 ngày)' }]} /></div>
      <div className="overflow-x-auto"><table className="w-full whitespace-nowrap text-left text-sm"><thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500"><tr>{['Nhân viên', 'Loại lịch / Miền', 'Thời gian', 'Trạng thái', ''].map((label, i) => <th key={i} className="p-4">{label}</th>)}</tr></thead><tbody>
        {rows.map(shift => { const ongoing = shift.status === 'scheduled' && new Date(shift.starts_at).getTime() <= Date.now() && new Date(shift.ends_at).getTime() > Date.now();
          return <tr key={shift.shift_id} className="border-t border-slate-100"><td className="p-4 font-semibold">{shift.user.full_name}</td><td className="p-4">{shift.duty_type === 'page' ? 'Trực page' : 'Nghỉ'}<p className="mt-1 text-xs text-slate-500">{shift.region_code ? WORKFORCE_REGIONS[shift.region_code] : 'Toàn quốc'}</p></td><td className="p-4">{workforceDate(shift.starts_at)}<p className="mt-1 text-xs text-slate-500">đến {workforceDate(shift.ends_at)}</p>{shift.note && <p className="mt-1 max-w-xs whitespace-normal text-xs text-slate-500">{shift.note}</p>}</td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs ${ongoing ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{shift.status === 'cancelled' ? 'Đã hủy' : ongoing ? (shift.duty_type === 'page' ? 'Đang trực' : 'Đang nghỉ') : new Date(shift.ends_at).getTime() <= Date.now() ? 'Đã kết thúc' : 'Đã xếp lịch'}</span></td><td className="p-4">{actor.isManager && shift.status !== 'cancelled' && new Date(shift.ends_at).getTime() > Date.now() && <button disabled={busy} onClick={() => void onCancel(shift.shift_id)} className="text-xs font-semibold text-rose-600">Hủy lịch</button>}</td></tr>;
        })}
        {!rows.length && <tr><td colSpan={5} className="p-10 text-center text-slate-400">Chưa có lịch trong phạm vi này.</td></tr>}
      </tbody></table></div>
    </div>
  </div>;
}
