"use client";

import { useId, useRef, useState, type FormEvent } from 'react';
import { CalendarDays, MapPin, Plus, UsersRound, X } from 'lucide-react';
import { CREW_ROLES, WORKFORCE_REGIONS, type CrewPayload, type CrewRole, type Employee, type WorkforceSchedule } from 'shared';
import { Dialog } from '@/components/common/overlays/Dialog';
import CustomDropdown from '@/components/common/forms/CustomDropdown';
import { DateTimeInput } from '@/components/common/date-time/DateTimeInput';
import { formatLocalDateTime } from '@/lib/utils/dateTime';
import { fromVietnamInput, vietnamInput, workforceDate } from '@/lib/admin/workforce/api';

type AssignmentForm = { key: number; roles: CrewRole[]; user_id: string; report_at: string; release_at: string; note: string };
const roleKeys = Object.keys(CREW_ROLES) as CrewRole[];
const roleOptions = roleKeys.map(role => ({ value: role, label: CREW_ROLES[role] }));
const roleRank = (roles: CrewRole[]) => roleKeys.findIndex(role => roles.includes(role));
const dropdownClass = 'min-w-0 [&_label]:mb-2 [&_label]:block [&_label]:text-[13px] [&_label]:font-medium [&_label]:text-slate-700 [&_button[aria-haspopup]]:min-h-11 [&_button[aria-haspopup]]:min-w-0 [&_button[aria-haspopup]]:rounded-lg [&_button[aria-haspopup]]:border-slate-300 [&_button[aria-haspopup]]:bg-white [&_button[aria-haspopup]]:text-sm';
const dateTimeClass = '[&_label]:mb-2 [&_label]:text-[13px] [&_label]:font-medium [&_label]:text-slate-700 [&_button[aria-haspopup=dialog]]:rounded-lg [&_button[aria-haspopup=dialog]]:border-slate-300';

export function CrewEditor({ schedule, employees, busy, onClose, onSave, requireOverride = false }: {
  schedule: WorkforceSchedule; employees: Employee[]; busy: boolean; requireOverride?: boolean; onClose: () => void; onSave: (body: CrewPayload) => Promise<void>;
}) {
  const titleId = useId();
  const summaryId = useId();
  const nextKey = useRef(-1);
  const newItem = (roles: CrewRole[]): AssignmentForm => ({ key: nextKey.current--, roles, user_id: '', report_at: vietnamInput(schedule.start_date), release_at: vietnamInput(schedule.end_date), note: '' });
  const [items, setItems] = useState<AssignmentForm[]>(() => schedule.crew.length
    ? [...schedule.crew].sort((a, b) => roleRank(a.roles) - roleRank(b.roles)).map(item => ({ key: item.assignment_id, roles: roleKeys.filter(role => item.roles.includes(role)), user_id: String(item.user_id), report_at: vietnamInput(item.report_at), release_at: vietnamInput(item.release_at), note: item.note || '' }))
    : [newItem(['tour_leader'])]);
  const [requiredCount, setRequiredCount] = useState(String(schedule.crew_required_count));
  const [error, setError] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const tourStart = new Date(vietnamInput(schedule.start_date));
  const tourEnd = new Date(vietnamInput(schedule.end_date));
  const eligible = (employee: Employee, roles: CrewRole[]) => employee.status === 'active' && employee.account_status === 1
    && roles.every(role => employee.roles.includes(role)) && (employee.roles.includes('admin') || employee.regions.includes(schedule.operating_region!));

  function update(key: number, changes: Partial<AssignmentForm>) {
    setItems(previous => previous.map(item => item.key === key ? { ...item, ...changes } : item));
    setError('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (requireOverride && !overrideReason.trim()) { setError('Vui lòng ghi lý do sửa thông tin đã chốt hoặc quá hạn.'); return; }
    if (items.some(item => item.roles.length !== 1)) { setError('Vui lòng chọn một chức vụ cho từng nhân sự trước khi lưu.'); return; }
    if (items.some(item => !employees.some(employee => String(employee.user_id) === item.user_id && eligible(employee, item.roles)))) {
      setError('Vui lòng chọn nhân viên hợp lệ cho từng dòng hoặc gỡ dòng không sử dụng.'); return;
    }
    if (new Set(items.map(item => item.user_id)).size !== items.length) { setError('Mỗi nhân viên chỉ được chọn một lần trong chuyến.'); return; }
    if (items.some(item => !item.report_at || !item.release_at || !Number.isFinite(Date.parse(item.report_at)) || !Number.isFinite(Date.parse(item.release_at)))) {
      setError('Vui lòng chọn đầy đủ ngày giờ bắt đầu và kết thúc điều động.'); return;
    }
    if (items.some(item => item.release_at <= item.report_at || item.report_at > vietnamInput(schedule.start_date) || item.release_at < vietnamInput(schedule.end_date))) {
      setError('Thời gian điều động phải bao trọn chuyến: bắt đầu không muộn hơn giờ khởi hành và kết thúc không sớm hơn giờ kết thúc chuyến.'); return;
    }
    setError('');
    void onSave({ crew_required_count: Number(requiredCount), ...(requireOverride ? { override_reason: overrideReason.trim() } : {}), assignments: items.map(({ key, ...item }) => ({ ...item, user_id: Number(item.user_id), report_at: fromVietnamInput(item.report_at), release_at: fromVietnamInput(item.release_at) })) });
  }

  return <Dialog onClose={() => !busy && onClose()} labelledBy={titleId} describedBy={summaryId}>
    <div className="my-auto flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <header className="flex shrink-0 items-start gap-3 border-b border-slate-200 px-5 py-5 sm:gap-4 sm:px-7 sm:py-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600 sm:size-12"><UsersRound size={25} /></span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-lg font-bold tracking-tight text-[#152641] sm:text-xl">Phân công nhân sự chuyến đi</h2>
          <div id={summaryId} className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs leading-5 text-slate-500 sm:text-[13px]">
            <span className="font-semibold text-slate-700">{schedule.tours.name}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} className="shrink-0 text-blue-500" />Ngày đi: {workforceDate(schedule.start_date)}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} className="shrink-0 text-blue-500" />Ngày kết thúc: {workforceDate(schedule.end_date)}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="shrink-0 text-blue-500" />{schedule.departure_location.name}</span>
            <span>{schedule.operating_region ? WORKFORCE_REGIONS[schedule.operating_region] : 'Chưa chọn miền điều hành'}</span>
          </div>
        </div>
        <button type="button" disabled={busy} aria-label="Đóng phân công nhân sự" onClick={onClose} className="-mr-1 -mt-1 shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-40"><X size={22} /></button>
      </header>
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-7">
          <section className="space-y-2.5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-700">Số nhân sự tối thiểu
                <input required type="number" min={1} max={2147483647} step={1} disabled={busy} className="h-10 w-24 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50" value={requiredCount} onChange={event => { setRequiredCount(event.target.value); setError(''); }} />
              </label>
              <p className="text-[13px] text-slate-500">Đã phân công <span className="font-semibold text-slate-700">{items.filter(item => item.user_id).length}/{requiredCount || '…'}</span> người</p>
            </div>
            <p className="text-xs leading-5 text-slate-500">Chuyến cần có cả Trưởng đoàn và Hướng dẫn viên. Mỗi nhân sự chọn một chức vụ; có thể thêm Phó đoàn tùy quy mô chuyến.</p>
          </section>
          {requireOverride && <label className="mb-5 block rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800">Lý do sửa ngoại lệ (bắt buộc)
            <textarea required maxLength={1000} rows={2} disabled={busy} value={overrideReason} onChange={event => setOverrideReason(event.target.value)} placeholder="Ví dụ: hướng dẫn viên có việc đột xuất, cần thay người..." className="mt-2 block w-full rounded-lg border border-amber-200 bg-white p-3 text-sm font-normal text-slate-700" />
            <span className="mt-2 block font-normal leading-5">Thay đổi được lưu lịch sử. Hệ thống công bố lại khi nhân sự xác nhận đầy đủ.</span>
          </label>}
          {items.map((item, index) => {
            const candidates = employees.filter(employee => eligible(employee, item.roles) && !items.some(other => other.key !== item.key && other.user_id === String(employee.user_id)));
            return <fieldset key={item.key} disabled={busy} className="min-w-0 border-t border-slate-200 py-5 sm:py-6">
              <legend className="sr-only">Nhân sự {index + 1}</legend>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-base font-bold text-[#152641]">Nhân sự {String(index + 1).padStart(2, '0')}</h3>
                <button type="button" onClick={() => { setItems(previous => previous.filter(row => row.key !== item.key)); setError(''); }} className="rounded px-1 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-40">Gỡ nhân sự</button>
              </div>
              <div className="grid min-w-0 gap-x-5 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                <div className="min-w-0">
                  <CustomDropdown label="Vai trò trong chuyến" ariaLabel={`Vai trò nhân sự ${index + 1}`} variant="compact" matchTriggerWidth className={dropdownClass}
                    selectedValue={item.roles.join(',')} placeholder={item.roles.map(role => CREW_ROLES[role]).join(' kiêm ') || 'Chọn chức vụ'} options={roleOptions} onSelect={value => {
                      const roles: CrewRole[] = [value as CrewRole];
                      const employee = employees.find(employee => String(employee.user_id) === item.user_id);
                      update(item.key, { roles, user_id: employee && eligible(employee, roles) ? item.user_id : '' });
                    }} />
                  {item.roles.length > 1 && <p className="mt-1.5 text-xs text-amber-700">Phân công cũ đang kiêm nhiệm. Chọn một trong ba chức vụ để cập nhật.</p>}
                </div>
                <div className="min-w-0">
                  <CustomDropdown label="Nhân viên" ariaLabel={`Nhân viên ${index + 1}`} variant="compact" matchTriggerWidth className={dropdownClass}
                    selectedValue={item.user_id} onSelect={value => update(item.key, { user_id: value })}
                    options={[{ value: '', label: 'Chọn nhân viên' }, ...candidates.map(employee => ({ value: String(employee.user_id), label: `${employee.full_name} · ${employee.employee_code}` }))]} />
                  {!candidates.length && <p className="mt-1.5 text-xs leading-5 text-amber-700">Chưa có nhân viên đang hoạt động đáp ứng vai trò và miền này.</p>}
                </div>
                <DateTimeInput label="Bắt đầu điều động" ariaLabel={`Bắt đầu điều động nhân sự ${index + 1}`} className={dateTimeClass} value={item.report_at ? new Date(item.report_at) : null} maxDate={tourStart} disabled={busy} onChange={date => update(item.key, { report_at: date ? formatLocalDateTime(date) : '' })} />
                <DateTimeInput label="Kết thúc điều động" ariaLabel={`Kết thúc điều động nhân sự ${index + 1}`} className={dateTimeClass} value={item.release_at ? new Date(item.release_at) : null} minDate={tourEnd} disabled={busy} onChange={date => update(item.key, { release_at: date ? formatLocalDateTime(date) : '' })} />
                <label className="block min-w-0 text-[13px] font-medium text-slate-700 sm:col-span-2">Ghi chú điều động
                  <input maxLength={1000} className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50" value={item.note} placeholder="Ví dụ: Phụ trách xe số 2..." onChange={event => update(item.key, { note: event.target.value })} />
                </label>
              </div>
            </fieldset>;
          })}
          <div className="space-y-3 pb-5">
            <button type="button" disabled={busy} onClick={() => { setItems(previous => [...previous, newItem(previous.some(item => item.roles.includes('tour_leader')) ? ['guide'] : ['tour_leader'])]); setError(''); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-blue-400 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-40"><Plus size={18} />Thêm nhân sự</button>
            <p className="text-xs leading-5 text-slate-500">Thời gian điều động phải bao trọn chuyến. Có thể lưu phân công chưa đủ người để bổ sung sau; hệ thống kiểm tra trùng lịch khi lưu.</p>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm leading-5 text-red-600">{error}</p>}
          </div>
        </div>
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
          <p className="text-xs text-slate-500">Giờ Việt Nam (GMT+7)</p>
          <div className="ml-auto flex gap-3">
            <button type="button" disabled={busy} onClick={onClose} className="min-h-10 rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Hủy</button>
            <button type="submit" disabled={busy} className="min-h-10 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{busy ? 'Đang lưu...' : 'Lưu phân công'}</button>
          </div>
        </footer>
      </form>
    </div>
  </Dialog>;
}
