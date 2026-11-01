"use client";

import { Copy, Sparkles } from 'lucide-react';
import type { ScheduleFormState, TourAmenity } from 'shared';
import { copyTourAmenities } from 'shared';
import { AdminFormCard } from '@/components/admin/common/AdminFormCard';
import { TourAmenitiesEditor } from '@/components/admin/tours/editor/TourAmenitiesEditor';

export function ScheduleAmenitiesCard({ form, template, disabled, onChange }: {
  form: ScheduleFormState;
  template: TourAmenity[];
  disabled: boolean;
  onChange: (updater: (previous: ScheduleFormState) => ScheduleFormState) => void;
}) {
  const copyTemplate = () => onChange(previous => ({ ...previous, use_tour_amenities: true,
    copy_tour_amenities: true, tour_schedule_amenities: copyTourAmenities(template),
  }));

  return <AdminFormCard title="Tiện ích của lịch khởi hành" icon={<Sparkles className="h-5 w-5 text-sky-500" />} bodyClassName="space-y-5 p-6">
    <label className={`flex items-center gap-3 rounded-2xl border p-4 text-sm font-bold ${disabled ? 'border-slate-200 bg-slate-50 text-slate-500' : 'cursor-pointer border-sky-100 bg-sky-50 text-sky-900'}`}>
      <input type="checkbox" checked={form.use_tour_amenities} disabled={disabled} onChange={event => {
        if (event.target.checked) copyTemplate();
        else onChange(previous => ({ ...previous, use_tour_amenities: false, copy_tour_amenities: false }));
      }} className="h-4 w-4 accent-sky-600" />
      Sử dụng tiện ích gốc từ tour
    </label>
    <p className="text-sm leading-6 text-slate-500">{disabled
      ? 'Tiện ích đã được khóa vì chuyến đã khởi hành hoặc có đơn đặt. Nội dung đã lưu vẫn được hiển thị bên dưới.'
      : 'Bỏ chọn để chỉnh sửa ngay nội dung đã sao chép, không cần nhập lại. Mỗi chuyến giữ bản riêng; thay đổi mẫu tour không tự cập nhật chuyến này.'}</p>
    {form.use_tour_amenities && !disabled && <button type="button" onClick={copyTemplate} className="flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"><Copy size={16} />Sao chép lại mẫu tour hiện tại</button>}
    {form.use_tour_amenities || disabled ? <div className="space-y-3">
      {form.tour_schedule_amenities.length ? form.tour_schedule_amenities.map(item => <details key={item.kind} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <summary className="cursor-pointer text-sm font-bold text-slate-800">{item.title}{item.is_visible === false ? ' · Đang ẩn' : ''}</summary>
        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{item.content || 'Thông tin khách sạn/phương tiện lấy từ phân bổ của chuyến.'}</p>
      </details>) : <p className="text-sm text-slate-500">Chưa có tiện ích trong bản sao. Bỏ chọn để thêm tiện ích riêng cho chuyến.</p>}
      {form.copy_tour_amenities && <p className="text-xs font-medium text-sky-700">Sẽ sao chép mẫu hiện tại khi lưu lịch khởi hành.</p>}
    </div> : <TourAmenitiesEditor embedded scheduleMode value={form.tour_schedule_amenities} onChange={items => onChange(previous => ({
      ...previous, tour_schedule_amenities: items.map(item => ({ ...item, is_visible: item.is_visible !== false })),
    }))} />}
  </AdminFormCard>;
}
