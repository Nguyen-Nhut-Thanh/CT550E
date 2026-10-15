import { CalendarDays, Minus, Plus, Users } from "lucide-react";
import type { TourSchedule } from "shared";
import { formatDate } from "@/lib/client/utils/utils";
import { formatVND } from "@/lib/client/utils/utils";
import type { TravelerType } from "@/lib/client/utils/booking";

interface BookingPassengerCountsProps {
  schedules: TourSchedule[];
  selectedSchedule: TourSchedule;
  onScheduleChange: (schedule: TourSchedule) => void;
  adultCount: number;
  childCount: number;
  infantCount: number;
  totalGuests: number;
  adultUnitPrice: number;
  childUnitPrice: number;
  infantUnitPrice: number;
  onCountChange: (type: TravelerType, delta: number) => void;
}

export function BookingPassengerCounts({
  schedules, selectedSchedule, onScheduleChange,
  adultCount,
  childCount,
  infantCount,
  totalGuests,
  adultUnitPrice,
  childUnitPrice,
  infantUnitPrice,
  onCountChange,
}: BookingPassengerCountsProps) {
  const getTravelerLabel = (type: TravelerType) => {
    if (type === "adult") return "Người lớn";
    if (type === "child") return "Trẻ em";
    return "Em bé";
  };

  const passengerTypes = [
    {
      type: "adult" as const,
      count: adultCount,
      subtitle: formatVND(adultUnitPrice),
      ageHint: "Từ 12 tuổi trở lên",
    },
    {
      type: "child" as const,
      count: childCount,
      subtitle: formatVND(childUnitPrice),
      ageHint: "Từ 2 -> 12 tuổi",
    },
    {
      type: "infant" as const,
      count: infantCount,
      subtitle: formatVND(infantUnitPrice),
      ageHint: "Dưới 2 tuổi",
    },
  ];

  return (
    <div id="booking-passengers" className="scroll-mt-28 rounded-2xl border border-blue-100/60 bg-white p-5 shadow-[0_4px_24px_rgba(37,99,235,0.04)] sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <CalendarDays className="h-5 w-5 text-blue-700" />1. Thông tin hành khách
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Vui lòng chọn đúng độ tuổi và số lượng hành khách.
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-right">
          <p className="text-xs font-medium text-slate-500">Tổng khách</p>
          <p className="text-lg font-bold text-slate-900">{totalGuests}</p>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <label className="rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-600">Ngày khởi hành
          <select value={selectedSchedule.tour_schedule_id} onChange={(event) => {
            const schedule = schedules.find(item => item.tour_schedule_id === Number(event.target.value));
            if (schedule) onScheduleChange(schedule);
          }} className="mt-2 block w-full rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500">
            {schedules.map(schedule => <option key={schedule.tour_schedule_id} value={schedule.tour_schedule_id}>{formatDate(schedule.start_date)} · Còn {Math.max(schedule.quota - schedule.booked_count, 0)} chỗ</option>)}
          </select>
        </label>
        <div className="rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-600">Số lượng khách<div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-900"><Users className="h-4 w-4 text-blue-700" />{totalGuests} người</div></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {passengerTypes.map((item) => (
          <div
            key={item.type}
            className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-3.5 shadow-[0_3px_12px_rgba(59,130,246,0.04)]"
            style={{ backgroundImage: 'url("/images/background/ticket.png")', backgroundSize: "105% 114%", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
          >
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <p className="shrink-0 text-sm font-bold text-slate-950">
                  {getTravelerLabel(item.type)}
                </p>
                <p className="text-right text-[10px] font-medium text-slate-500">
                  {item.ageHint}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="whitespace-nowrap text-sm font-bold tracking-tight text-[#ff343b]">{item.subtitle}</p>
              <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/70 p-1">
                <button
                  type="button"
                  aria-label={`Giảm số ${getTravelerLabel(item.type).toLowerCase()}`}
                  disabled={item.count <= (item.type === "adult" ? 1 : 0)}
                  onClick={() => onCountChange(item.type, -1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-100 bg-white text-slate-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span aria-live="polite" className="w-6 text-center text-base font-bold text-slate-950">
                  {item.count}
                </span>
                <button
                  type="button"
                  aria-label={`Tăng số ${getTravelerLabel(item.type).toLowerCase()}`}
                  onClick={() => onCountChange(item.type, 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-100 bg-white text-slate-600 transition hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
