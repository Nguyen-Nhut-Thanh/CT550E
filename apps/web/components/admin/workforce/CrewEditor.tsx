"use client";

import { useRef, useState } from 'react';
import { Plus, Trash2, UsersRound } from 'lucide-react';
import { CREW_ROLES, WORKFORCE_REGIONS, type CrewPayload, type CrewRole, type Employee, type WorkforceSchedule } from 'shared';
import { AdminModalShell } from '@/components/admin/common/AdminModalShell';
import CustomDropdown from '@/components/common/forms/CustomDropdown';
import { fromVietnamInput, vietnamInput, workforceDate } from '@/lib/admin/workforce/api';

type AssignmentForm = { key: number; roles: CrewRole[]; user_id: string; report_at: string; release_at: string; note: string };
const roleKeys = Object.keys(CREW_ROLES) as CrewRole[];
const roleOptions = Array.from({ length: (1 << roleKeys.length) - 1 }, (_, index) => roleKeys.filter((_, bit) => (index + 1) & (1 << bit)))
  .sort((a, b) => a.length - b.length)
  .map(roles => ({ value: roles.join(','), label: roles.map(role => CREW_ROLES[role]).join(' kiêm ') }));
const roleRank = (roles: CrewRole[]) => roleKeys.findIndex(role => roles.includes(role));
const dropdownClass = 'min-w-0 [&_label]:mb-1 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_button[aria-haspopup]]:min-w-0 [&_button[aria-haspopup]]:bg-white [&_button[aria-haspopup]]:py-2.5';

export function CrewEditor({ schedule, employees, busy, onClose, onSave }: {
  schedule: WorkforceSchedule; employees: Employee[]; busy: boolean; onClose: () => void; onSave: (body: CrewPayload) => Promise<void>;
}) {
  const nextKey = useRef(-1);
  const newItem = (roles: CrewRole[]): AssignmentForm => ({ key: nextKey.current--, roles, user_id: '', report_at: vietnamInput(schedule.start_date), release_at: vietnamInput(schedule.end_date), note: '' });
  const [items, setItems] = useState<AssignmentForm[]>(() => schedule.crew.length
    ? [...schedule.crew].sort((a, b) => roleRank(a.roles) - roleRank(b.roles)).map(item => ({ key: item.assignment_id, roles: roleKeys.filter(role => item.roles.includes(role)), user_id: String(item.user_id), report_at: vietnamInput(item.report_at), release_at: vietnamInput(item.release_at), note: item.note || '' }))
    : [newItem(['tour_leader'])]);
  const [requiredCount, setRequiredCount] = useState(String(schedule.crew_required_count));
  const [error, setError] = useState('');
  const input = 'mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm font-normal';
  const eligible = (employee: Employee, roles: CrewRole[]) => employee.status === 'active' && employee.account_status === 1
    && roles.every(role => employee.roles.includes(role)) && (employee.roles.includes('admin') || employee.regions.includes(schedule.operating_region!));
  function update(key: number, changes: Partial<AssignmentForm>) {
    setItems(previous => previous.map(item => item.key === key ? { ...item, ...changes } : item));
    setError('');
  }
  return <AdminModalShell title="Phân công nhân sự chuyến đi" icon={<UsersRound size={20} />} onClose={() => !busy && onClose()}>
    <form className="space-y-5 p-6" onSubmit={event => {
      event.preventDefault();
      if (items.some(item => !employees.some(employee => String(employee.user_id) === item.user_id && eligible(employee, item.roles)))) {
        setError('Vui lòng chọn nhân viên hợp lệ cho từng dòng hoặc gỡ dòng không sử dụng.'); return;
      }
      if (new Set(items.map(item => item.user_id)).size !== items.length) { setError('Mỗi người chỉ chọn một lần. Chọn các vai trò kiêm nhiệm trên cùng một dòng.'); return; }
      setError('');
      void onSave({ crew_required_count: Number(requiredCount), assignments: items.map(({ key, ...item }) => ({ ...item, user_id: Number(item.user_id), report_at: fromVietnamInput(item.report_at), release_at: fromVietnamInput(item.release_at) })) });
    }}>
      <div className="rounded-xl bg-blue-50 p-4 text-sm"><p className="font-bold text-blue-950">{schedule.tours.name}</p><p className="mt-1 text-blue-700">{workforceDate(schedule.start_date)} · {schedule.departure_location.name}</p><p className="mt-1 text-xs text-slate-600">Điều hành: {schedule.operating_region ? WORKFORCE_REGIONS[schedule.operating_region] : 'Chưa chọn'}</p></div>
      <div className="space-y-2 rounded-xl bg-slate-50 p-4">
        <label className="block text-xs font-semibold text-slate-600">Số nhân sự tối thiểu cho chuyến<input required type="number" min={1} step={1} className={input} value={requiredCount} onChange={event => setRequiredCount(event.target.value)} /></label>
        <p className="text-xs leading-relaxed text-slate-500">Đếm theo người, không đếm theo vai trò. Chuyến cần có cả Trưởng đoàn và Hướng dẫn viên; một người có thể kiêm nhiệm. Có thể thêm Phó đoàn tùy quy mô chuyến, không bắt buộc mọi chuyến phải có.</p>
        <p className="text-xs font-semibold text-blue-700">Đang xếp {items.filter(item => item.user_id).length} người / tối thiểu {requiredCount || '…'} người</p>
      </div>
      {items.map((item, index) => {
        const candidates = employees.filter(employee => eligible(employee, item.roles) && !items.some(other => other.key !== item.key && other.user_id === String(employee.user_id)));
        return <fieldset key={item.key} className="space-y-3 rounded-2xl border border-slate-200 p-4">
          <legend className="px-2 text-sm font-bold text-slate-800">Nhân sự {index + 1}</legend>
          <div className="flex justify-end"><button type="button" disabled={busy} onClick={() => { setItems(previous => previous.filter(row => row.key !== item.key)); setError(''); }} className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600"><Trash2 size={14} />Gỡ nhân sự {index + 1}</button></div>
          <CustomDropdown label="Vai trò trong chuyến" ariaLabel={`Vai trò nhân sự ${index + 1}`} variant="compact" matchTriggerWidth className={dropdownClass}
            selectedValue={item.roles.join(',')} options={roleOptions} onSelect={value => {
              const roles = value.split(',') as CrewRole[];
              const employee = employees.find(employee => String(employee.user_id) === item.user_id);
              update(item.key, { roles, user_id: employee && eligible(employee, roles) ? item.user_id : '' });
            }} />
          <CustomDropdown label="Nhân viên" ariaLabel={`Nhân viên ${index + 1}`} variant="compact" matchTriggerWidth className={dropdownClass}
            selectedValue={item.user_id} onSelect={value => update(item.key, { user_id: value })}
            options={[{ value: '', label: 'Chọn nhân viên' }, ...candidates.map(employee => ({ value: String(employee.user_id), label: `${employee.full_name} · ${employee.employee_code}` }))]} />
          {!candidates.length && <p className="text-xs text-amber-700">Chưa có nhân viên khả dụng trong danh sách cho vai trò và miền này. Cần hồ sơ đang hoạt động, có đủ vai trò đã chọn và chưa được thêm ở dòng khác.</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-600">Bắt đầu điều động<input required type="datetime-local" className={input} value={item.report_at} onChange={event => update(item.key, { report_at: event.target.value })} /></label>
            <label className="text-xs font-semibold text-slate-600">Kết thúc điều động<input required type="datetime-local" min={item.report_at} className={input} value={item.release_at} onChange={event => update(item.key, { release_at: event.target.value })} /></label>
          </div>
          <label className="block text-xs font-semibold text-slate-600">Ghi chú điều động<input maxLength={1000} className={input} value={item.note} placeholder="Ví dụ: Phụ trách xe số 2, có mặt trước một ngày" onChange={event => update(item.key, { note: event.target.value })} /></label>
        </fieldset>;
      })}
      <button type="button" disabled={busy} onClick={() => { setItems(previous => [...previous, newItem(previous.some(item => item.roles.includes('tour_leader')) ? ['guide'] : ['tour_leader'])]); setError(''); }} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-[650] text-blue-700"><Plus size={16} />Thêm nhân sự</button>
      <p className="text-xs leading-relaxed text-slate-500">Giờ Việt Nam. Khoảng điều động phải bao trọn chuyến, có thể tính thêm thời gian di chuyển và nghỉ. Hệ thống kiểm tra trùng lịch khi lưu. Có thể lưu phân công chưa đủ người để bổ sung sau; chỉ báo đủ nhân sự khi đạt yêu cầu và tất cả người được phân công đã nhận chuyến.</p>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      <div className="flex justify-end gap-3"><button type="button" disabled={busy} onClick={onClose} className="rounded-xl border px-4 py-2.5 text-sm">Hủy</button><button disabled={busy} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-[650] text-white disabled:opacity-50">Lưu phân công</button></div>
    </form>
  </AdminModalShell>;
}
