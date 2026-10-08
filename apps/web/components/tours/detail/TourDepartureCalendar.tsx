"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { formatVND } from "@/lib/client/utils/utils";
import { getSingleRoomSurchargeTotal } from "@/lib/client/utils/tourPricing";
import type { TourSchedule } from "shared";

type Props = {
  schedules: TourSchedule[];
  selectedScheduleId: number | null;
  onSelect: (scheduleId: number) => void;
  onReset: () => void;
};

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
  onSelect,
  onReset,
}: Props) {
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

  useEffect(() => {
    setCurrentMonth(monthOptions[0]);
  }, [monthOptions]);

  const selectedSchedule = useMemo(
    () =>
      schedules.find((schedule) => schedule.tour_schedule_id === selectedScheduleId) ??
      null,
    [schedules, selectedScheduleId],
  );

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
    const map = new Map<number, TourSchedule>();

    schedules.forEach((schedule) => {
      const date = new Date(schedule.start_date);
      if (
        date.getMonth() === currentMonth.getMonth() &&
        date.getFullYear() === currentMonth.getFullYear()
      ) {
        map.set(date.getDate(), schedule);
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
    <section id="tour-schedules" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
          <CalendarIcon className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Lịch khởi hành</h2>
      </div>

      <div className="flex flex-col gap-5 md:flex-row">
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
        <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
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

          <div className="p-3 sm:p-5">
            <div className="grid grid-cols-7 gap-y-2 text-center">
              {WEEKDAYS.map((weekday) => (
                <div
                  key={weekday}
                  className={`pb-2 text-xs sm:text-sm font-bold ${
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
                  return <div key={`empty-${index}`} className="h-14 sm:h-16" />;
                }

                const schedule = scheduleMap.get(day);

                return (
                  <button
                    key={`${currentMonth}-${day}`}
                    type="button"
                    disabled={!schedule}
                    onClick={() =>
                      schedule && onSelect(schedule.tour_schedule_id)
                    }
                    className={`relative flex h-14 sm:h-16 flex-col items-center justify-center rounded-xl p-1 transition border border-transparent ${
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
                      <span className="mt-0.5 text-[11px] sm:text-xs font-black text-[#ef3b2d]">
                        {Math.round(Number(schedule.price) / 1000).toLocaleString(
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
    </section>
  );
}
