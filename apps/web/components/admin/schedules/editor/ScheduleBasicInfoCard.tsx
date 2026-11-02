"use client";

import { AdminDatePicker } from "@/components/admin/common/AdminDatePicker";
import { PriceInput } from "@/components/common/forms/PriceInput";
import { VndPriceInput } from "@/components/common/forms/VndPriceInput";
import { TimeInput } from "@/components/common/date-time/TimeInput";
import { updateScheduleBasePrice, updateScheduleStart } from "@/lib/admin/schedules/forms";
import { parseCalendarDate, startOfDay } from "@/lib/utils/calendar";
import { formatLocalDate } from "@/lib/utils/dateTime";
import { Baby, CalendarDays, Clock3, Coins, Plane, Tag, UserRound, UsersRound } from "lucide-react";
import { FaChild } from "react-icons/fa6";
import type { ScheduleBasicInfoCardProps } from "shared";
import { TourEditorCard as ScheduleEditorCard } from "@/components/admin/tours/editor/TourEditorCard";

export function ScheduleBasicInfoCard({ form, isPast, hasBookings, bookedCount, originalQuota, tourInfo, onFormChange }: ScheduleBasicInfoCardProps) {
  const lockedDates = isPast || (hasBookings && form.pickup_points.length > 0);
  const minimum = new Date(Date.now() + Number(tourInfo?.cut_off_hours ?? 0) * 60 * 60 * 1000);
  const minScheduleDate = formatLocalDate(minimum);
  const changeDate = (value: string) => {
    const date = parseCalendarDate(value);
    const minDate = parseCalendarDate(minScheduleDate);
    if (!date || date < startOfDay(new Date()) || (minDate && date < minDate)) return;
    onFormChange(previous => updateScheduleStart(previous, value, previous.start_time, Number(tourInfo?.duration_days) || 1));
  };

  return <ScheduleEditorCard id="schedule-info" title="Thông tin cơ bản & Giá" description="Thiết lập ngày khởi hành, giờ khởi hành, giá vé và số lượng chỗ cho đợt tour." icon={Plane}>
    <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-[#26324e]"><CalendarDays size={18} className="text-[#0868f9]" />Ngày khởi hành</p>
        <div className="[&_button[aria-expanded]]:min-h-[48px] [&_button[aria-expanded]]:rounded-[11px] [&_button[aria-expanded]]:border-[#dfe6f1] [&_button[aria-expanded]]:shadow-[0_3px_8px_#308ac80a]">
          <AdminDatePicker value={form.start_date} minDate={minScheduleDate} disabled={lockedDates} placeholder="Chọn ngày khởi hành" onChange={changeDate} />
        </div>
        {form.end_date && <p className="text-[11px] text-[#8293ac]">Ngày về: {parseCalendarDate(form.end_date)?.toLocaleDateString("vi-VN")}</p>}
        {hasBookings && !isPast && <p className="text-[11px] leading-[1.6] text-amber-700">{lockedDates ? "Ngày giờ đã khóa theo thông tin đón khách đã xác nhận." : "Đổi ngày giờ sẽ gửi thông báo đến khách đã đặt."}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="schedule-start-time" className="flex items-center gap-2 text-[13px] font-semibold text-[#26324e]"><Clock3 size={18} className="text-[#0868f9]" />Giờ khởi hành</label>
        <TimeInput id="schedule-start-time" ariaLabel="Giờ khởi hành" disabled={lockedDates} value={form.start_time} onChange={time => {
            onFormChange(previous => previous.start_date ? updateScheduleStart(previous, previous.start_date, time, Number(tourInfo?.duration_days) || 1) : { ...previous, start_time: time });
          }} />
      </div>
      <div className="space-y-2">
        <label htmlFor="schedule-base-price" className="flex items-center gap-2 text-[13px] font-semibold text-[#26324e]"><Tag size={18} className="text-[#0868f9]" />Giá đợt khởi hành (Người lớn)</label>
        <VndPriceInput id="schedule-base-price" disabled={isPast} value={form.price} placeholder="Ví dụ: 11.100.000" onChange={price => onFormChange(previous => updateScheduleBasePrice(previous, price))} />
        {hasBookings && !isPast && <p className="text-[11px] leading-[1.6] text-[#7287a4]">Giá mới áp dụng cho đơn mới. Đơn đã đặt giữ nguyên giá đã chốt.</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="schedule-quota" className="flex items-center gap-2 text-[13px] font-semibold text-[#26324e]"><UsersRound size={18} className="text-[#0868f9]" />Số lượng chỗ tối đa</label>
        <div className="relative"><UsersRound size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#0868f9]" />
          <input id="schedule-quota" type="number" min={hasBookings ? originalQuota : 1} step={1} disabled={isPast} value={form.quota || ""} placeholder="VD: 20" onChange={event => onFormChange(previous => ({ ...previous, quota: Number(event.target.value) }))} className="min-h-[48px] w-full rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] py-3 pr-3 pl-11 text-[14px] text-[#203553] shadow-[0_3px_8px_#308ac80a] outline-none focus:border-[#79a8f5] disabled:cursor-not-allowed disabled:text-slate-400" />
        </div>
        {hasBookings && !isPast && <p className="text-[11px] leading-[1.6] text-amber-700">Đã có {bookedCount} khách. Chỉ được tăng số chỗ so với mức hiện tại {originalQuota}.</p>}
      </div>
    </div>

    <div className="mt-7">
      <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-[#26324e]"><Coins size={18} className="text-[#0868f9]" />Bảng giá chi tiết (VNĐ)<span aria-hidden="true" className="ml-2 h-px flex-1 bg-[#dfebf8]" /></h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {form.prices.map(item => {
          const adult = item.passenger_type === "adult";
          const Icon = adult ? UserRound : item.passenger_type === "child" ? FaChild : Baby;
          const label = adult ? "Người lớn" : item.passenger_type === "child" ? "Trẻ em" : "Em bé";
          const inputId = `schedule-price-${item.passenger_type}`;
          return <div key={item.passenger_type} className="min-w-0 rounded-[17px] bg-[linear-gradient(135deg,#f6faff,#edf5ff)] p-3.5">
            <label htmlFor={inputId} className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[#26324e]"><Icon size={19} className="text-[#0868f9]" />{label}</label>
            <PriceInput id={inputId} label="" icon={null} suffix="" value={adult ? form.price : item.price} disabled={isPast || adult} placeholder="0" inputClassName="min-h-10 w-full min-w-0 rounded-[11px] border border-[#d8e4f4] bg-white/65 px-3 py-2 text-[14px] font-bold text-[#0865e9] outline-none focus:border-[#79a8f5] disabled:cursor-not-allowed disabled:bg-[#f5f8fc] disabled:text-[#9ba7b8]" onChange={price => onFormChange(previous => ({ ...previous, prices: previous.prices.map(row => row.passenger_type === item.passenger_type ? { ...row, price } : row) }))} />
          </div>;
        })}
      </div>
    </div>
  </ScheduleEditorCard>;
}
