"use client";
import { useState } from 'react';
import { AdminModalShell } from '@/components/admin/common/AdminModalShell';
import CustomDropdown from '@/components/common/forms/CustomDropdown';
import { WORKFORCE_REGIONS, WORKFORCE_ROLES, type Employee, type EmployeePayload, type RegionCode, type WorkforceActor, type WorkforceRole } from 'shared';
import { Users } from 'lucide-react';

export function EmployeeEditor({ employee, actor, busy, onClose, onSave }: {
  employee: Employee | null; actor: WorkforceActor; busy: boolean; onClose: () => void; onSave: (body: EmployeePayload) => Promise<void>;
}) {
  const initialRegion = actor.regions[0] || 'south';
  const [form, setForm] = useState<EmployeePayload>(employee ? { ...employee, password: undefined } : {
    full_name: '', email: '', password: '', phone: '', employee_code: `NV${Date.now().toString().slice(-8)}`, position: '',
    primary_region: initialRegion, regions: [initialRegion], roles: ['page_staff'], employment_type: 'full_time', status: 'active', languages: [], note: '',
  });
  const [languages, setLanguages] = useState(employee?.languages.join(', ') || '');
  const regions = Object.entries(WORKFORCE_REGIONS).filter(([code]) => actor.isAdmin || actor.regions.includes(code as RegionCode));
  const input = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 disabled:bg-slate-50';
  const dropdownClass = 'min-w-0 [&_label]:mb-1 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_button[aria-haspopup]]:min-w-0 [&_button[aria-haspopup]]:bg-white [&_button[aria-haspopup]]:py-2.5';
  return <AdminModalShell title={employee ? 'Cập nhật nhân viên' : 'Thêm nhân viên'} icon={<Users size={20} />} onClose={() => !busy && onClose()}>
    <form className="space-y-5 p-6" onSubmit={event => { event.preventDefault(); void onSave({ ...form, languages: languages.split(',').map(item => item.trim()).filter(Boolean) }); }}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-600">Họ và tên<input required maxLength={150} className={input} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></label>
        <label className="text-xs font-semibold text-slate-600">Mã nhân viên<input required maxLength={30} className={input} value={form.employee_code} onChange={e => setForm({ ...form, employee_code: e.target.value })} /></label>
        <label className="text-xs font-semibold text-slate-600">Email đăng nhập<input required type="email" disabled={!!employee} maxLength={150} autoComplete="off" className={input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
        {!employee && <label className="text-xs font-semibold text-slate-600">Mật khẩu ban đầu<input required type="password" minLength={8} maxLength={72} autoComplete="new-password" className={input} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label>}
        <label className="text-xs font-semibold text-slate-600">Số điện thoại<input maxLength={15} className={input} value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
        <label className="text-xs font-semibold text-slate-600">Chức danh<input required maxLength={100} placeholder="Ví dụ: Tư vấn tour miền Nam" className={input} value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} /></label>
        <CustomDropdown label="Hình thức làm việc" variant="compact" matchTriggerWidth className={dropdownClass} selectedValue={form.employment_type}
          onSelect={value => setForm({ ...form, employment_type: value as EmployeePayload['employment_type'] })}
          options={[{ value: 'full_time', label: 'Nhân viên chính thức' }, { value: 'contractor', label: 'Cộng tác viên' }]} />
        <CustomDropdown label="Trạng thái" variant="compact" matchTriggerWidth className={dropdownClass} selectedValue={form.status}
          onSelect={value => setForm({ ...form, status: value as EmployeePayload['status'] })}
          options={[{ value: 'active', label: 'Đang làm việc' }, { value: 'inactive', label: 'Ngưng hoạt động' }]} />
      </div>
      <fieldset className="rounded-2xl border border-slate-200 p-4"><legend className="px-2 text-sm font-bold text-slate-800">Vai trò & quyền thao tác</legend>
        <div className="grid gap-3 sm:grid-cols-2">{Object.entries(WORKFORCE_ROLES).filter(([role]) => actor.isAdmin || !['admin', 'region_manager'].includes(role)).map(([role, label]) => <label key={role} className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.roles.includes(role as WorkforceRole)} onChange={e => setForm({ ...form, roles: e.target.checked ? [...form.roles, role as WorkforceRole] : form.roles.filter(item => item !== role) })} />{label}
        </label>)}</div>
      </fieldset>
      <fieldset className="rounded-2xl border border-slate-200 p-4"><legend className="px-2 text-sm font-bold text-slate-800">Miền phụ trách / được phép hỗ trợ</legend>
        <div className="flex flex-wrap gap-4">{regions.map(([code, label]) => <label key={code} className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.regions.includes(code as RegionCode)} onChange={e => {
          const next = e.target.checked ? [...form.regions, code as RegionCode] : form.regions.filter(item => item !== code);
          setForm({ ...form, regions: next, primary_region: form.primary_region && next.includes(form.primary_region) ? form.primary_region : next[0] || null });
        }} />{label}</label>)}</div>
        <CustomDropdown label="Miền chính" variant="compact" matchTriggerWidth className={`mt-4 ${dropdownClass}`} selectedValue={form.primary_region || ''}
          onSelect={value => setForm({ ...form, primary_region: value ? value as RegionCode : null })}
          options={[{ value: '', label: 'Chưa chọn / toàn quốc' }, ...form.regions.map(code => ({ value: code, label: WORKFORCE_REGIONS[code] }))]} />
      </fieldset>
      <label className="block text-xs font-semibold text-slate-600">Ngoại ngữ (cách nhau bằng dấu phẩy)<input maxLength={500} className={input} value={languages} onChange={e => setLanguages(e.target.value)} placeholder="Tiếng Anh, Tiếng Trung" /></label>
      <label className="block text-xs font-semibold text-slate-600">Kinh nghiệm, tuyến am hiểu và ghi chú<textarea maxLength={2000} className={input} rows={3} value={form.note || ''} onChange={e => setForm({ ...form, note: e.target.value })} /></label>
      <div className="flex justify-end gap-3"><button type="button" disabled={busy} onClick={onClose} className="rounded-xl border px-5 py-2.5 text-sm">Hủy</button><button disabled={busy} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-[650] text-white disabled:opacity-50">{busy ? 'Đang lưu…' : 'Lưu nhân viên'}</button></div>
    </form>
  </AdminModalShell>;
}
