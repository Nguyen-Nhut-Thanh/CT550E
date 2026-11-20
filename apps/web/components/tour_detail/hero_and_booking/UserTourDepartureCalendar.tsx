"use client";

import {
  getSingleRoomSurchargeTotal,
  getActiveSchedulePromotion,
} from "@/lib/booking/client/pricing";
import { resolvePickupPoint } from "@/lib/booking/client/departure";
import { getAgeCutoffs } from "@/lib/booking/client/birthday";
import { formatCompactVND, formatVND } from "@/lib/utils/currency";
import { Dialog } from "@/components/common/dialogs_and_feedback/dialogs/Dialog";
import { Tooltip } from "@/components/common/dialogs_and_feedback/dialogs/Tooltip";
import {
  ArrowLeft,
  Bus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Info,
  MapPin,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import type { TourDepartureCalendarProps as Props, TourSchedule } from "shared";

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
  useEffect(() => {
    setSelectedDay(null);
  }, [currentMonth]);

  useEffect(() => {
    setCurrentMonth(monthOptions[0]);
  }, [monthOptions]);

  const selectedSchedule = useMemo(
    () =>
      schedules.find(
        (schedule) => schedule.tour_schedule_id === selectedScheduleId,
      ) ?? null,
    [schedules, selectedScheduleId],
  );
  const selectedPickup = resolvePickupPoint(
    selectedSchedule,
    selectedPickupPointId,
  );

  const cutoffs = useMemo(
    () =>
      selectedSchedule?.start_date
        ? getAgeCutoffs(selectedSchedule.start_date)
        : null,
    [selectedSchedule?.start_date],
  );

  const pricingRows = useMemo(
    () => [
      {
        label: "Người lớn",
        ageRange: "Từ 12 tuổi trở lên",
        description: cutoffs
          ? `Áp dụng cho hành khách sinh trước ngày ${cutoffs.maxAdultStr} (đủ 12 tuổi trở lên tính đến ngày khởi hành).`
          : "Áp dụng cho hành khách từ đủ 12 tuổi trở lên tính đến ngày khởi hành.",
        value: Number(selectedSchedule?.price ?? 0),
      },
      {
        label: "Trẻ em",
        ageRange: "Từ 2 đến dưới 12 tuổi",
        description: cutoffs
          ? `Áp dụng cho trẻ sinh từ ngày ${cutoffs.minChildStr} đến ${cutoffs.maxChildStr}.`
          : "Áp dụng cho trẻ từ đủ 2 tuổi đến dưới 12 tuổi tính đến ngày khởi hành.",
        value: getPriceByType(selectedSchedule, "child"),
      },
      {
        label: "Em bé",
        ageRange: "Dưới 2 tuổi",
        description: cutoffs
          ? `Áp dụng cho em bé sinh sau ngày ${cutoffs.maxChildStr}.`
          : "Áp dụng cho em bé dưới 2 tuổi tính đến ngày khởi hành.",
        value: getPriceByType(selectedSchedule, "infant"),
      },
      {
        label: "Phụ thu phòng đơn",
        ageRange: "Dành cho khách ở 1 người/phòng",
        description:
          "Áp dụng khi quý khách đăng ký đi một mình hoặc có nhu cầu ở riêng phòng đơn trong suốt chuyến đi.",
        value: getSingleRoomSurchargeTotal(selectedSchedule),
      },
    ],
    [selectedSchedule, cutoffs],
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
    const isSoldOut =
      (Number(selectedSchedule.quota) || 0) <=
      (Number(selectedSchedule.booked_count) || 0);

    return (
      <section
        id="tour-schedules"
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại chọn ngày khác
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {isSoldOut && (
              <span className="rounded-full bg-rose-600 px-3.5 py-1 text-xs sm:text-sm font-black text-white shadow-2xs">
                ĐÃ KÍN CHỖ
              </span>
            )}
            <div className="rounded-full bg-red-50 px-4 py-2 text-xs sm:text-sm font-bold text-[#ef3b2d] border border-red-100">
              Khởi hành:{" "}
              {new Date(selectedSchedule.start_date).toLocaleDateString(
                "vi-VN",
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {/* Thông báo kín chỗ nếu lịch đã đủ khách */}
          {isSoldOut && (
            <div className="rounded-2xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 via-orange-50 to-rose-50 p-4 sm:p-5 text-rose-950 shadow-2xs">
              <div className="flex items-center gap-2.5 font-black text-sm sm:text-base text-rose-900">
                <span className="text-xl">📢</span>
                <span>Lịch khởi hành này hiện đã đủ khách (Kín chỗ)</span>
                <span className="ml-auto rounded-full bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wide">
                  Hết chỗ
                </span>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-rose-800 leading-relaxed font-medium">
                Chuyến khởi hành ngày{" "}
                <strong>
                  {new Date(selectedSchedule.start_date).toLocaleDateString(
                    "vi-VN",
                  )}
                </strong>{" "}
                hiện đã nhận đủ số lượng khách đăng ký ({selectedSchedule.quota}
                /{selectedSchedule.quota} khách).
              </p>
              <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-white/85 p-3 border border-rose-200/80 text-xs text-rose-900 leading-relaxed">
                <span className="text-base shrink-0">💡</span>
                <div>
                  <strong>Bạn muốn săn chỗ nếu có khách hủy?</strong> Hãy lưu
                  lại hoặc thường xuyên theo dõi lại lịch này trên hệ thống. Quý
                  khách cũng có thể nhấn nút <strong>Chat tư vấn</strong> bên
                  cạnh để được nhân viên điều hành hỗ trợ ghi nhận nhu cầu và
                  thông báo ngay khi có chỗ trống!
                </div>
              </div>
            </div>
          )}

          {(() => {
            const promo = getActiveSchedulePromotion(selectedSchedule);
            if (!promo) return null;
            return (
              <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 shadow-2xs text-amber-950">
                <div className="flex items-center gap-2 font-black text-sm text-amber-900">
                  <span className="text-base">🎁</span>
                  <span>{promo.title}</span>
                  <span className="ml-auto rounded-full bg-amber-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 shadow-2xs">
                    Giảm {promo.discountLabel.replace(/^-/, "")}
                  </span>
                </div>
                {promo.giftDescription && (
                  <p className="mt-1.5 text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                    <span>✨ Quà tặng:</span>
                    <span>{promo.giftDescription}</span>
                  </p>
                )}
                {promo.originalPrice > promo.effectivePrice && (
                  <p className="mt-1.5 text-xs text-slate-600">
                    Giá gốc:{" "}
                    <span className="line-through">
                      {formatVND(promo.originalPrice)}
                    </span>{" "}
                    → Giá ưu đãi:{" "}
                    <strong className="text-[#ef3b2d] font-extrabold">
                      {formatVND(promo.effectivePrice)}
                    </strong>
                  </p>
                )}
              </div>
            );
          })()}

          <p className="font-semibold text-sky-800">
            Xuất phát:{" "}
            {selectedSchedule.departure_location?.name || "Chưa cập nhật"}
          </p>
          {!!selectedSchedule.pickup_points?.length && (
            <div className="rounded-xl bg-sky-50 p-4 text-sm text-slate-700">
              <p className="font-bold">
                {selectedPickup ? "Điểm đón đã chọn" : "Chọn điểm đón"}
              </p>
              {selectedPickup ? (
                <div className="mt-2 text-sm leading-6">
                  <strong>{selectedPickup.name}</strong> —{" "}
                  {selectedPickup.address}
                  <br />
                  {new Date(selectedPickup.pickup_at).toLocaleString("vi-VN", {
                    timeZone: "Asia/Ho_Chi_Minh",
                  })}
                  {selectedPickup.note ? ` · ${selectedPickup.note}` : ""}
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  {selectedSchedule.pickup_points.map((point) => (
                    <button
                      key={point.pickup_point_id}
                      type="button"
                      onClick={() =>
                        onSelect(
                          selectedSchedule.tour_schedule_id,
                          point.pickup_point_id,
                        )
                      }
                      className="block w-full rounded-lg border border-sky-200 bg-white p-3 text-left text-sm leading-6 hover:border-sky-400"
                    >
                      <strong>{point.name}</strong> — {point.address}
                      <br />
                      {new Date(point.pickup_at).toLocaleString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                      })}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-900">
                Bảng giá theo đối tượng
              </h3>
              <div
                className={`rounded-full px-3 py-1 text-xs font-extrabold ${isSoldOut ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-sky-100 text-sky-800"}`}
              >
                {isSoldOut
                  ? "Đã hết chỗ (0 chỗ)"
                  : `Còn ${Math.max(selectedSchedule.quota - selectedSchedule.booked_count, 0)} chỗ`}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {pricingRows.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-2xs transition-colors hover:border-slate-300"
                >
                  <Tooltip
                    placement="auto"
                    trigger={
                      <div className="group/tip flex items-center gap-1.5 min-w-0 cursor-help">
                        <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover/tip:text-blue-700 transition-colors">
                          {item.label}
                        </span>
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-slate-400 group-hover/tip:bg-blue-50 group-hover/tip:text-blue-600 transition-colors">
                          <HelpCircle className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    }
                    contentClassName="!min-w-0 w-max max-w-[300px] p-3 text-xs shadow-xl border border-slate-200 bg-white rounded-2xl z-50 text-left pointer-events-none"
                    content={
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[13px]">
                          <Info className="h-4 w-4 text-blue-600 shrink-0" />
                          <span>
                            {item.label}: {item.ageRange}
                          </span>
                        </div>
                        <p className="text-[12.5px] text-slate-700 leading-snug font-medium">
                          {item.description}
                        </p>
                      </div>
                    }
                  />
                  <span className="text-sm sm:text-base font-extrabold text-[#ef3b2d] shrink-0 ml-2">
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
              Giá trên áp dụng theo lịch khởi hành đã chọn. Vui lòng kiểm tra kỹ
              hành trình, nhóm hành khách và phụ thu phát sinh trước khi bấm đặt
              tour.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // When no schedule is selected (rendering the calendar picker)
  return (
    <section
      id="tour-schedules"
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
    >
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
        <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white shadow-xs">
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
                  return (
                    <div
                      key={`empty-${index}`}
                      className="h-12 min-w-0 w-full sm:h-14"
                    />
                  );
                }

                const daySchedules = scheduleMap.get(day) || [];
                const schedule = daySchedules[0];
                const needsChoice =
                  daySchedules.length > 1 ||
                  daySchedules.some(
                    (item) => (item.pickup_points?.length ?? 0) > 1,
                  );
                const promoSchedules = daySchedules.filter((item) =>
                  Boolean(getActiveSchedulePromotion(item)),
                );
                const hasDayPromo = promoSchedules.length > 0;
                const isDaySoldOut =
                  daySchedules.length > 0 &&
                  daySchedules.every(
                    (item) =>
                      (Number(item.quota) || 0) <=
                      (Number(item.booked_count) || 0),
                  );
                const availableSchedules = daySchedules.filter(
                  (item) =>
                    (Number(item.quota) || 0) >
                    (Number(item.booked_count) || 0),
                );
                const displayPrice =
                  availableSchedules.length > 0
                    ? Math.min(
                        ...availableSchedules.map((item) => Number(item.price)),
                      )
                    : Math.min(
                        ...daySchedules.map((item) => Number(item.price)),
                      );

                const dayButton = (
                  <button
                    key={`${currentMonth}-${day}`}
                    type="button"
                    disabled={!schedule}
                    onClick={() => {
                      if (needsChoice) setSelectedDay(day);
                      else {
                        setSelectedDay(null);
                        onSelect(
                          schedule.tour_schedule_id,
                          resolvePickupPoint(schedule)?.pickup_point_id,
                        );
                      }
                    }}
                    aria-pressed={selectedDay === day}
                    aria-haspopup={needsChoice ? "dialog" : undefined}
                    className={`relative flex h-12 min-w-0 w-full flex-col items-center justify-center rounded-xl p-0.5 sm:h-14 sm:p-1 transition border ${
                      schedule
                        ? isDaySoldOut
                          ? "cursor-pointer bg-slate-100/90 border-slate-200 hover:bg-slate-200/70 hover:border-slate-300 shadow-2xs"
                          : "cursor-pointer bg-sky-50/60 border-sky-100 hover:bg-sky-100 hover:scale-105 shadow-2xs"
                        : "cursor-default text-slate-300 border-transparent"
                    }`}
                  >
                    {hasDayPromo && !isDaySoldOut && (
                      <span
                        className="absolute top-1 right-1 text-[9px] leading-none"
                        aria-hidden="true"
                      >
                        🎁
                      </span>
                    )}

                    <span
                      className={`text-xs sm:text-sm ${
                        schedule
                          ? isDaySoldOut
                            ? "font-bold text-slate-500"
                            : "font-bold text-slate-900"
                          : "text-slate-300 font-normal"
                      }`}
                    >
                      {day}
                    </span>

                    {schedule ? (
                      isDaySoldOut ? (
                        <span
                          className="mt-0.5 block w-full truncate text-[9.5px] sm:text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200/80 rounded px-0.5 py-0.2"
                          title="Đã kín chỗ / Hết vé (nhấp để xem thông tin hoặc chờ săn vé hủy)"
                        >
                          Hết chỗ
                        </span>
                      ) : (
                        <span
                          className="mt-0.5 block w-full truncate text-[10px] sm:text-xs font-black text-[#ef3b2d]"
                          title={formatVND(displayPrice)}
                        >
                          {availableSchedules.length > 1 ? "Từ " : ""}
                          {formatCompactVND(displayPrice)}
                        </span>
                      )
                    ) : null}
                  </button>
                );

                if (isDaySoldOut) {
                  return (
                    <Tooltip
                      key={`${currentMonth}-${day}`}
                      className="min-w-0"
                      trigger={dayButton}
                      content={
                        <div className="min-w-52 py-1 text-left">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-rose-700">
                            <span className="inline-block size-2 rounded-full bg-rose-600 animate-pulse" />
                            <span>Đã đủ khách (Kín chỗ)</span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                            Ngày {day}/{currentMonth.getMonth() + 1} hiện đã
                            nhận đủ{" "}
                            {daySchedules.reduce(
                              (sum, s) => sum + (s.quota || 0),
                              0,
                            )}{" "}
                            khách. Nhấp vào để xem chi tiết lịch trình hoặc theo
                            dõi săn vé khi có khách hủy.
                          </p>
                        </div>
                      }
                    />
                  );
                }

                return hasDayPromo ? (
                  <Tooltip
                    key={`${currentMonth}-${day}`}
                    className="min-w-0"
                    trigger={dayButton}
                    content={promoSchedules.map((promoSchedule) => {
                      const promo = getActiveSchedulePromotion(promoSchedule);
                      if (!promo) return null;
                      return (
                        <div
                          key={promoSchedule.tour_schedule_id}
                          className="min-w-56 border-b border-amber-100 py-1 last:border-0"
                        >
                          <div className="flex items-start gap-2 text-sm font-extrabold text-amber-900">
                            <span aria-hidden="true">🎁</span>
                            <span className="min-w-0 flex-1">
                              {promo.title}
                            </span>
                            <span className="shrink-0 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                              {promo.discountLabel}
                            </span>
                          </div>
                          {promo.originalPrice > promo.effectivePrice && (
                            <p className="mt-1.5 text-xs text-slate-600">
                              Giá gốc:{" "}
                              <span className="line-through">
                                {formatVND(promo.originalPrice)}
                              </span>{" "}
                              → Giá ưu đãi:{" "}
                              <strong className="font-extrabold text-[#ef3b2d]">
                                {formatVND(promo.effectivePrice)}
                              </strong>
                            </p>
                          )}
                          {promo.giftDescription && (
                            <p className="mt-1.5 text-xs font-semibold text-amber-800">
                              ✨ Quà tặng: {promo.giftDescription}
                            </p>
                          )}
                          {daySchedules.length > 1 && (
                            <p className="mt-1 text-[10px] text-slate-500">
                              Chuyến #{promoSchedule.tour_schedule_id}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  />
                ) : (
                  dayButton
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 bg-[#fffdf8] px-4 py-2.5 text-center">
            <p className="text-xs italic font-semibold text-[#ef3b2d]">
              * Nhấp vào ô ngày có giá tiền hoặc ngày &quot;Hết chỗ&quot; để xem
              thông tin chi tiết và tình trạng chỗ
            </p>
          </div>
        </div>
      </div>
      {selectedDay !== null && (
        <Dialog
          onClose={() => setSelectedDay(null)}
          labelledBy={choiceTitleId}
          describedBy={choiceDescriptionId}
          overlayClassName="bg-slate-950/45"
        >
          <div className="my-auto flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_24px_80px_#0f172a40]">
            <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600 sm:size-12">
                  <CalendarIcon size={23} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <h3
                    id={choiceTitleId}
                    className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl"
                  >
                    Chọn chuyến khởi hành
                  </h3>
                  <p
                    id={choiceDescriptionId}
                    className="mt-0.5 text-sm text-slate-500"
                  >
                    {new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth(),
                      selectedDay,
                    ).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                aria-label="Đóng chọn chuyến"
                className="shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                <X size={26} strokeWidth={1.5} />
              </button>
            </header>
            <div className="min-h-0 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="sm:overflow-x-auto">
                <div className="sm:min-w-[640px]">
                  <div className="hidden grid-cols-[150px_minmax(0,1fr)_100px_130px] items-center gap-4 rounded-lg bg-slate-100 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-600 sm:grid">
                    <span>Chuyến / xuất phát</span>
                    <span>Điểm đón</span>
                    <span className="text-center">Chỗ trống</span>
                    <span className="text-right">Giá tour</span>
                  </div>
                  <div className="divide-y divide-slate-200 border-y border-slate-200">
                    {(scheduleMap.get(selectedDay) || []).map((schedule) => {
                      const points = schedule.pickup_points?.length
                        ? schedule.pickup_points
                        : [null];
                      const isScheduleSoldOut =
                        (Number(schedule.quota) || 0) <=
                        (Number(schedule.booked_count) || 0);
                      return points.map((point) => (
                        <button
                          key={`${schedule.tour_schedule_id}-${point?.pickup_point_id ?? "none"}`}
                          type="button"
                          onClick={() => {
                            setSelectedDay(null);
                            onSelect(
                              schedule.tour_schedule_id,
                              point?.pickup_point_id ?? null,
                            );
                          }}
                          className={`group grid w-full cursor-pointer gap-2.5 px-4 py-4 text-left transition-colors sm:grid-cols-[150px_minmax(0,1fr)_100px_130px] sm:items-center sm:gap-4 ${
                            isScheduleSoldOut
                              ? "bg-slate-50/70 hover:bg-slate-100"
                              : "hover:bg-blue-50/70 focus-visible:bg-blue-50"
                          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500`}
                        >
                          <span className="block min-w-0">
                            <span
                              className={`block text-xl font-extrabold leading-tight ${isScheduleSoldOut ? "text-slate-600" : "text-slate-900"} transition-colors group-hover:text-blue-600`}
                            >
                              {new Date(schedule.start_date).toLocaleTimeString(
                                "vi-VN",
                                {
                                  timeZone: "Asia/Ho_Chi_Minh",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                            <span className="mt-0.5 block text-sm font-bold text-slate-800">
                              {schedule.departure_location?.name ||
                                "Chưa cập nhật"}
                            </span>
                            <span className="block text-xs text-slate-500">
                              Mã chuyến #{schedule.tour_schedule_id}
                            </span>
                          </span>

                          <span className="flex min-w-0 items-start gap-2 text-slate-700">
                            <MapPin
                              size={20}
                              className="mt-0.5 shrink-0 text-slate-500 transition-colors group-hover:text-blue-600"
                            />
                            {point ? (
                              <span className="min-w-0">
                                <strong className="font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                                  {point.name}
                                </strong>
                                <span className="mt-0.5 block text-sm text-slate-500 leading-relaxed">
                                  {new Date(point.pickup_at).toLocaleTimeString(
                                    "vi-VN",
                                    {
                                      timeZone: "Asia/Ho_Chi_Minh",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                  {point.address ? ` · ${point.address}` : ""}
                                </span>
                              </span>
                            ) : (
                              <span className="text-sm italic text-slate-500">
                                Chưa cập nhật điểm đón
                              </span>
                            )}
                          </span>

                          <span className="flex items-center gap-2 text-sm text-slate-700 sm:justify-center">
                            <Bus
                              size={19}
                              className={
                                isScheduleSoldOut
                                  ? "shrink-0 text-rose-500"
                                  : "shrink-0 text-slate-500"
                              }
                            />
                            {isScheduleSoldOut ? (
                              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-black text-rose-700 border border-rose-200">
                                Hết chỗ
                              </span>
                            ) : (
                              <span>
                                {Math.max(
                                  schedule.quota - schedule.booked_count,
                                  0,
                                )}{" "}
                                chỗ
                              </span>
                            )}
                          </span>

                          <span className="block sm:text-right">
                            <span
                              className={`block text-lg font-extrabold ${isScheduleSoldOut ? "text-slate-600" : "text-slate-900"} transition-colors group-hover:text-blue-600`}
                            >
                              {formatVND(schedule.price)}
                            </span>
                            {isScheduleSoldOut ? (
                              <span className="inline-block mt-0.5 text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded shadow-2xs">
                                Đã kín chỗ
                              </span>
                            ) : (
                              (() => {
                                const p = getActiveSchedulePromotion(schedule);
                                return p ? (
                                  <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded shadow-2xs">
                                    🎁 {p.title}
                                  </span>
                                ) : null;
                              })()
                            )}
                          </span>
                        </button>
                      ));
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </section>
  );
}
