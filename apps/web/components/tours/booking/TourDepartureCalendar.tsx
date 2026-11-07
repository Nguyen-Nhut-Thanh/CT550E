"use client";

import { getSingleRoomSurchargeTotal } from "@/lib/booking/pricing";
import { resolvePickupPoint } from '@/lib/booking/departure';
import { formatVND } from "@/lib/utils/currency";
import { Dialog } from '@/components/common/overlays/Dialog';
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import type { TourDepartureCalendarProps as Props, TourSchedule } from 'shared';

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function getPriceByType(schedule: TourSchedule | null, passengerType: string) {
  const matchedPrice = schedule?.tour_schedule_prices?.find(
    (item) => item.passenger_type === passengerType,
  );

  return matchedPrice ? Number(matchedPrice.price) : null;
}

export default function TourDepartureCalendar({
  schedules,
  selectedScheduleId,
  selectedPickupPointId = null,
  onSelect,
  onReset,
}: Props) {
  const choiceTitleId = useId();
  const choiceDescriptionId = useId();
  const monthOptions = useMemo(() => {
    const uniqueMonths = new Map<string, Date>();

    schedules.forEach((schedule) => {
      const date = new Date(schedule.start_date);
      if (Number.isNaN(date.getTime())) return;

      const monthDate = new Date(date.getFullYear(), date.getMonth(), 1);
      uniqueMonths.set(toMonthKey(monthDate), monthDate);
    });

    const sorted = Array.from(uniqueMonths.values()).sort(
      (a, b) => a.getTime() - b.getTime(),
    );

    return sorted.length ? sorted : [new Date()];
  }, [schedules]);

  const [currentMonth, setCurrentMonth] = useState<Date>(monthOptions[0]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  useEffect(() => { setSelectedDay(null); }, [currentMonth]);

  useEffect(() => {
    setCurrentMonth(monthOptions[0]);
  }, [monthOptions]);

  const selectedSchedule = useMemo(
    () =>
      schedules.find((schedule) => schedule.tour_schedule_id === selectedScheduleId) ??
      null,
    [schedules, selectedScheduleId],
  );
  const selectedPickup = resolvePickupPoint(selectedSchedule, selectedPickupPointId);

  const pricingRows = useMemo(
    () => [
      { label: "Người lớn", value: Number(selectedSchedule?.price ?? 0) },
      { label: "Trẻ em", value: getPriceByType(selectedSchedule, "child") },
      { label: "Em bé", value: getPriceByType(selectedSchedule, "infant") },
      {
        label: "Phụ thu phòng đơn",
        value: getSingleRoomSurchargeTotal(selectedSchedule),
      },
    ],
    [selectedSchedule],
  );

  const dayCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return [
      ...Array.from({ length: firstDayIndex }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [currentMonth]);

  const scheduleMap = useMemo(() => {
    const map = new Map<number, TourSchedule[]>();

    schedules.forEach((schedule) => {
      const date = new Date(schedule.start_date);
      if (
        date.getMonth() === currentMonth.getMonth() &&
        date.getFullYear() === currentMonth.getFullYear()
      ) {
        map.set(date.getDate(), [...(map.get(date.getDate()) || []), schedule]);
      }
    });

    return map;
  }, [currentMonth, schedules]);

  const currentMonthIndex = monthOptions.findIndex(
    (month) => toMonthKey(month) === toMonthKey(currentMonth),
  );

  // When a schedule is selected
  if (selectedSchedule) {
    return (
      <section id="tour-schedules" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại chọn ngày khác
          </button>

          <div className="rounded-full bg-red-50 px-4 py-2 text-xs sm:text-sm font-bold text-[#ef3b2d] border border-red-100">
            Khởi hành:{" "}
            {new Date(selectedSchedule.start_date).toLocaleDateString("vi-VN")}
          </div>
        </div>

        <div className="space-y-4 pt-1">
          <p className="font-semibold text-sky-800">Xuất phát: {selectedSchedule.departure_location?.name || "Chưa cập nhật"}</p>
          {!!selectedSchedule.pickup_points?.length && <div className="rounded-xl bg-sky-50 p-4 text-sm text-slate-700">
            <p className="font-bold">{selectedPickup ? 'Điểm đón đã chọn' : 'Chọn điểm đón'}</p>
            {selectedPickup ? <div className="mt-2 text-sm leading-6"><strong>{selectedPickup.name}</strong> — {selectedPickup.address}<br />{new Date(selectedPickup.pickup_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}{selectedPickup.note ? ` · ${selectedPickup.note}` : ''}</div> : <div className="mt-2 space-y-2">{selectedSchedule.pickup_points.map(point => <button key={point.pickup_point_id} type="button" onClick={() => onSelect(selectedSchedule.tour_schedule_id, point.pickup_point_id)} className="block w-full rounded-lg border border-sky-200 bg-white p-3 text-left text-sm leading-6 hover:border-sky-400"><strong>{point.name}</strong> — {point.address}<br />{new Date(point.pickup_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</button>)}</div>}
          </div>}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-900">Bảng giá theo đối tượng</h3>
              <div className="rounded-full bg-sky-100 px-3 py-1 text-xs font-extrabold text-sky-800">
                Còn{" "}
                {Math.max(selectedSchedule.quota - selectedSchedule.booked_count, 0)}{" "}
                chỗ
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {pricingRows.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-2xs"
                >
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">
                    {item.label}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-[#ef3b2d]">
                    {item.value != null && item.value > 0
                      ? formatVND(item.value)
                      : "Liên hệ"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-[#fff4e8] px-4 py-3.5 text-xs sm:text-sm text-orange-900">
            <p className="font-bold">Lưu ý khi chọn ngày</p>
            <p className="mt-1 leading-relaxed text-orange-800 text-xs">
              Giá trên áp dụng theo lịch khởi hành đã chọn. Vui lòng kiểm tra
              kỹ hành trình, nhóm hành khách và phụ thu phát sinh trước khi
              bấm đặt tour.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // When no schedule is selected (rendering the calendar picker)
  return (
    <section id="tour-schedules" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
          <CalendarIcon className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Lịch khởi hành</h2>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        {/* Month Selector Sidebar */}
        <aside className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 md:w-[138px] shrink-0">
          <p className="mb-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Chọn tháng
          </p>

          <div className="space-y-2">
            {monthOptions.map((month) => {
              const isActive = toMonthKey(month) === toMonthKey(currentMonth);

              return (
                <button
                  key={toMonthKey(month)}
                  type="button"
                  onClick={() => setCurrentMonth(month)}
                  className={`w-full rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold transition ${
                    isActive
                      ? "bg-[#0b63b6] text-white shadow-md shadow-sky-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:text-[#0b63b6] hover:border-sky-200"
                  }`}
                >
                  {`${month.getMonth() + 1}/${month.getFullYear()}`}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Calendar Grid Box */}
        <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 bg-slate-50/50">
            <button
              type="button"
              onClick={() =>
                currentMonthIndex > 0 &&
                setCurrentMonth(monthOptions[currentMonthIndex - 1])
              }
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
              disabled={currentMonthIndex <= 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h3 className="text-base font-extrabold uppercase tracking-wide text-[#0b63b6]">
              {`Tháng ${currentMonth.getMonth() + 1}/${currentMonth.getFullYear()}`}
            </h3>

            <button
              type="button"
              onClick={() =>
                currentMonthIndex < monthOptions.length - 1 &&
                setCurrentMonth(monthOptions[currentMonthIndex + 1])
              }
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
              disabled={currentMonthIndex >= monthOptions.length - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((weekday) => (
                <div
                  key={weekday}
                  className={`pb-1 text-xs sm:text-sm font-bold ${
                    weekday === "T7" || weekday === "CN"
                      ? "text-[#ef3b2d]"
                      : "text-[#0b63b6]"
                  }`}
                >
                  {weekday}
                </div>
              ))}

              {dayCells.map((day, index) => {
                if (day == null) {
                  return <div key={`empty-${index}`} className="h-12 min-w-0 w-full sm:h-14" />;
                }

                const daySchedules = scheduleMap.get(day) || [];
                const schedule = daySchedules[0];
                const needsChoice = daySchedules.length > 1 || daySchedules.some(item => (item.pickup_points?.length ?? 0) > 1);

                return (
                  <button
                    key={`${currentMonth}-${day}`}
                    type="button"
                    disabled={!schedule}
                    onClick={() => {
                      if (needsChoice) setSelectedDay(day);
                      else { setSelectedDay(null); onSelect(schedule.tour_schedule_id, resolvePickupPoint(schedule)?.pickup_point_id); }
                    }}
                    aria-pressed={selectedDay === day}
                    aria-haspopup={needsChoice ? 'dialog' : undefined}
                    className={`relative flex h-12 min-w-0 w-full flex-col items-center justify-center rounded-xl p-0.5 sm:h-14 sm:p-1 transition border border-transparent ${
                      schedule
                        ? "cursor-pointer bg-sky-50/60 border-sky-100 hover:bg-sky-100 hover:scale-105 shadow-2xs"
                        : "cursor-default text-slate-300"
                    }`}
                  >
                    <span
                      className={`text-xs sm:text-sm ${
                        schedule ? "font-bold text-slate-900" : "text-slate-300 font-normal"
                      }`}
                    >
                      {day}
                    </span>

                    {schedule ? (
                      <span className="mt-0.5 block w-full truncate text-[10px] sm:text-xs font-black text-[#ef3b2d]" title={formatVND(Math.min(...daySchedules.map(item => Number(item.price))))}>
                        {daySchedules.length > 1 ? "Từ " : ""}{Math.round(Math.min(...daySchedules.map(item => Number(item.price))) / 1000).toLocaleString(
                          "vi-VN",
                        )}
                        K
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 bg-[#fffdf8] px-4 py-2.5 text-center">
            <p className="text-xs italic font-semibold text-[#ef3b2d]">
              * Nhấp vào ô ngày có giá tiền để xem thông tin chi tiết và đặt tour
            </p>
          </div>
        </div>
      </div>
      {selectedDay !== null && <Dialog onClose={() => setSelectedDay(null)} labelledBy={choiceTitleId} describedBy={choiceDescriptionId}>
        <div className="my-auto flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 p-5">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600"><CalendarIcon size={20} /></span>
              <div className="min-w-0">
                <h3 id={choiceTitleId} className="font-bold text-slate-900 sm:text-lg">Chọn chuyến ngày {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDay).toLocaleDateString('vi-VN')}</h3>
                <p id={choiceDescriptionId} className="mt-1 text-xs leading-5 text-slate-500">Chọn chuyến phù hợp với nơi xuất phát, giờ đi và điểm đón của bạn.</p>
              </div>
            </div>
            <button type="button" onClick={() => setSelectedDay(null)} aria-label="Đóng chọn chuyến" className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-sky-500"><X size={20} /></button>
          </header>
          <div className="min-h-0 space-y-3 overflow-y-auto p-5">
            {(scheduleMap.get(selectedDay) || []).map(schedule => <article key={schedule.tour_schedule_id} className="rounded-xl border border-sky-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{schedule.departure_location?.name || 'Chưa cập nhật'} <span className="font-medium text-slate-500">· {new Date(schedule.start_date).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })}</span></p>
                  <p className="mt-1 text-xs text-slate-500">Chuyến #{schedule.tour_schedule_id} · Còn {Math.max(schedule.quota - schedule.booked_count, 0)} chỗ</p>
                </div>
                <p className="text-sm font-bold text-rose-600 sm:text-base">{formatVND(schedule.price)}</p>
              </div>
              {schedule.pickup_points?.length ? <div className="mt-3 space-y-2 border-t border-sky-100 pt-3">
                {schedule.pickup_points.map(point => <button key={point.pickup_point_id} type="button" onClick={() => { setSelectedDay(null); onSelect(schedule.tour_schedule_id, point.pickup_point_id); }} className="flex w-full items-center justify-between gap-3 rounded-lg border border-sky-100 bg-sky-50/50 p-3 text-left text-xs leading-5 transition hover:border-sky-400 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-500">
                  <span className="flex min-w-0 items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-sky-600" /><span><strong className="font-semibold text-slate-700">{point.name}</strong> · {new Date(point.pickup_at).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })}<span className="block text-slate-500">{point.address}</span></span></span>
                  <span className="shrink-0 font-semibold text-sky-700">Chọn →</span>
                </button>)}
              </div> : <button type="button" onClick={() => { setSelectedDay(null); onSelect(schedule.tour_schedule_id, null); }} className="mt-3 w-full rounded-lg border border-sky-100 bg-sky-50/50 px-3 py-2 text-right text-xs font-semibold text-sky-700 hover:border-sky-400 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-500">Chọn chuyến này →</button>}
            </article>)}
          </div>
        </div>
      </Dialog>}
    </section>
  );
}
