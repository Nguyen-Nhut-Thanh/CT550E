"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import { getTourSchedules } from "@/lib/schedules/admin/api";
import { formatVND } from "@/lib/utils/currency";

export interface ScheduleItem {
  tour_schedule_id: number;
  code?: string | null;
  start_date: string;
  end_date: string;
  quota?: number | null;
  capacity?: number | null;
  booked_count?: number | null;
  price?: number | string | null;
  price_adult?: number | string | null;
  price_child?: number | string | null;
  price_infant?: number | string | null;
  status?: number | null;
  cut_off_hours?: number | null;
  departure_location?: {
    name: string;
  } | null;
}

export interface AdminRescheduleSchedulePickerProps {
  tourId?: number;
  currentScheduleId?: number;
  totalGuests: number;
  selectedScheduleId?: number;
  onSelectSchedule: (scheduleId: number, schedule?: ScheduleItem) => void;
  disabled?: boolean;
  cutOffHours?: number | null;
}

export function AdminRescheduleSchedulePicker({
  tourId,
  currentScheduleId,
  totalGuests,
  selectedScheduleId,
  onSelectSchedule,
  disabled = false,
  cutOffHours,
}: AdminRescheduleSchedulePickerProps) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dùng ref lưu các giá trị prop để tránh re-trigger fetch API khi cha re-render hoặc khi user chọn item
  const onSelectScheduleRef = useRef(onSelectSchedule);
  onSelectScheduleRef.current = onSelectSchedule;

  const totalGuestsRef = useRef(totalGuests);
  totalGuestsRef.current = totalGuests;

  const cutOffHoursRef = useRef(cutOffHours);
  cutOffHoursRef.current = cutOffHours;

  const selectedScheduleIdRef = useRef(selectedScheduleId);
  selectedScheduleIdRef.current = selectedScheduleId;

  useEffect(() => {
    if (!tourId) return;

    let isMounted = true;
    async function fetchSchedules() {
      try {
        setLoading(true);
        setError("");
        const data = await getTourSchedules<ScheduleItem>(tourId!);
        if (!isMounted) return;

        const now = Date.now();
        const minHours = cutOffHoursRef.current ?? 24;

        // Lọc các đợt: khác đợt hiện tại, đang bán (status === 1), chưa khởi hành và chưa bước vào thời gian chốt tour (cut_off_hours)
        const available = (Array.isArray(data) ? data : []).filter((s) => {
          if (s.tour_schedule_id === currentScheduleId) return false;
          if (s.status !== undefined && s.status !== 1) return false;

          const startMs = new Date(s.start_date).getTime();
          if (startMs <= now) return false;

          const scheduleMinHours = s.cut_off_hours ?? minHours;
          const diffHours = (startMs - now) / (1000 * 60 * 60);
          return diffHours >= scheduleMinHours;
        });

        setSchedules(available);

        // Tự động chọn đợt đầu tiên còn đủ chỗ nếu chưa có lựa chọn hoặc lựa chọn hiện tại không còn khả dụng
        const currentSelectedStillAvailable = available.some(
          (s) => s.tour_schedule_id === selectedScheduleIdRef.current,
        );

        if (
          available.length > 0 &&
          (!selectedScheduleIdRef.current || !currentSelectedStillAvailable)
        ) {
          const firstEligible = available.find(
            (s) =>
              ((s.quota ?? s.capacity ?? 0) - (s.booked_count || 0)) >=
              totalGuestsRef.current,
          );
          if (firstEligible) {
            onSelectScheduleRef.current(firstEligible.tour_schedule_id, firstEligible);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách đợt khởi hành khác.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void fetchSchedules();
    return () => {
      isMounted = false;
    };
  }, [tourId, currentScheduleId]); // CHỈ fetch khi tourId hoặc currentScheduleId thay đổi, KHÔNG phụ thuộc vào state tương tác của form

  if (loading) {
    return (
      <div className="flex min-h-[140px] items-center justify-center p-6 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 text-xs gap-2">
        <Loader2 size={16} className="animate-spin text-blue-600" />
        <span>Đang tìm các đợt khởi hành còn chỗ...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs">
        {error}
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 space-y-1">
        <strong className="block font-bold">
          Không tìm thấy đợt khởi hành nào khác còn nhận khách
        </strong>
        <p className="text-[11.5px] text-amber-800 leading-relaxed">
          Hiện tại tour này không có đợt khởi hành nào khác còn nhận khách (đã chốt tour trước {cutOffHours ?? 24}h, đã qua ngày khởi hành hoặc đã hết chỗ). Vui lòng chọn phương án <strong>Hoàn tiền 100%</strong> cho khách hoặc tạo thêm đợt khởi hành mới trước khi dời lịch.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <span>Chọn ngày khởi hành mới</span>
          <span className="text-rose-500 font-black">*</span>
        </label>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <span>Cần đủ cho <strong>{totalGuests}</strong> khách</span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[10.5px]">
            Chốt trước {cutOffHours ?? 24}h
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {schedules.map((schedule) => {
          const startStr = new Date(schedule.start_date).toLocaleDateString(
            "vi-VN",
            { day: "2-digit", month: "2-digit", year: "numeric" },
          );
          const endStr = new Date(schedule.end_date).toLocaleDateString(
            "vi-VN",
            { day: "2-digit", month: "2-digit", year: "numeric" },
          );
          const totalSlots = schedule.quota ?? schedule.capacity ?? 0;
          const remainingSlots = Math.max(
            0,
            totalSlots - (schedule.booked_count || 0),
          );
          const isFull = remainingSlots < totalGuests;
          const isSelected = selectedScheduleId === schedule.tour_schedule_id;

          return (
            <button
              key={schedule.tour_schedule_id}
              type="button"
              disabled={disabled || isFull}
              onClick={() => onSelectSchedule(schedule.tour_schedule_id, schedule)}
              className={`w-full text-left p-3 rounded-xl border transition-colors duration-150 cursor-pointer relative ${
                isSelected
                  ? "border-blue-500 bg-blue-50/70 shadow-2xs ring-1 ring-blue-500/30"
                  : isFull
                    ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={15}
                    className={
                      isSelected ? "text-blue-600" : "text-slate-400"
                    }
                  />
                  <strong className="text-xs text-slate-900 font-bold">
                    {startStr} - {endStr}
                  </strong>
                  {schedule.code ? (
                    <span className="font-mono text-[10px] text-slate-400">
                      #{schedule.code}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isFull
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : remainingSlots <= 5
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {isFull
                      ? `Hết chỗ (còn ${remainingSlots})`
                      : `Còn ${remainingSlots} chỗ`}
                  </span>

                  {isSelected ? (
                    <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                  ) : null}
                </div>
              </div>

              {schedule.departure_location?.name ? (
                <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">
                    Nơi đón: {schedule.departure_location.name}
                  </span>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
