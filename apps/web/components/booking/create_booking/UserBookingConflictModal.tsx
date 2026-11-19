"use client";

import React, { useEffect, useMemo } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  Calendar,
  CalendarRange,
  Clock,
  ExternalLink,
  Globe,
  Info,
  Lock,
  MapPin,
  Plane,
  ShieldAlert,
  Star,
  Users,
  X,
} from "lucide-react";
import type { PublicTourDetail, ScheduleConflict, TourSchedule } from "shared";

export interface BookingConflictModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  conflicts: ScheduleConflict[];
  currentTour: PublicTourDetail | null;
  currentSchedule: TourSchedule | null;
  unitPrice?: number;
}

function parseDateAny(d?: string | Date | null): Date | null {
  if (!d) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  const str = String(d).trim();
  if (str.includes("/")) {
    const parts = str.split("/").map(Number);
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatVnDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatGender(gender?: string | null): string | null {
  if (!gender) return null;
  const g = gender.toLowerCase().trim();
  if (g === "male" || g === "nam") return "Nam";
  if (g === "female" || g === "nu" || g === "nữ") return "Nữ";
  return gender;
}

function formatBirthday(bday?: string | Date | null): string | null {
  if (!bday) return null;
  if (typeof bday === "string" && bday.includes("/")) return bday;
  const parsed = parseDateAny(bday);
  return parsed ? formatVnDate(parsed) : String(bday);
}

export function BookingConflictModal({
  open,
  onClose,
  onConfirm,
  conflicts,
  currentTour,
  currentSchedule,
  unitPrice,
}: BookingConflictModalProps) {
  // Đóng modal khi bấm ESC
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Khóa scroll body khi modal mở
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Lấy thông tin tour đã đặt trước đó từ record xung đột đầu tiên
  const priorTour = conflicts[0] || null;
  const isSameAccount = priorTour?.isSameAccount ?? false;

  // Tính toán khoảng ngày giao nhau giữa 2 tour
  const overlapRangeStr = useMemo(() => {
    if (!priorTour || !currentSchedule?.start_date) return null;
    const oldS = parseDateAny(priorTour.startDate);
    const oldE = parseDateAny(priorTour.endDate);
    const curS = parseDateAny(currentSchedule.start_date);
    const curE = parseDateAny(currentSchedule.end_date);
    if (!oldS || !oldE || !curS || !curE) return null;

    const maxStart = new Date(Math.max(oldS.getTime(), curS.getTime()));
    const minEnd = new Date(Math.min(oldE.getTime(), curE.getTime()));
    if (maxStart.getTime() > minEnd.getTime()) return null;

    const maxSStr = formatVnDate(maxStart);
    const minEStr = formatVnDate(minEnd);
    return maxSStr === minEStr ? maxSStr : `${maxSStr} – ${minEStr}`;
  }, [priorTour, currentSchedule]);

  // Lọc danh sách hành khách bị trùng lịch duy nhất
  const uniqueTravelers = useMemo(() => {
    const map = new Map<
      string,
      {
        travelerName: string;
        idNumber: string;
        gender?: string | null;
        birthday?: string | Date | null;
      }
    >();
    for (const c of conflicts) {
      const key = `${c.idNumber || ""}_${c.travelerName}`;
      if (!map.has(key)) {
        map.set(key, {
          travelerName: c.travelerName,
          idNumber: c.idNumber,
          gender: c.gender || null,
          birthday: c.birthday || null,
        });
      }
    }
    return Array.from(map.values());
  }, [conflicts]);

  if (!open) return null;

  // Thông tin Tour hiện tại đang chọn đặt
  const currentStartDateStr = currentSchedule?.start_date
    ? (() => {
        const d = parseDateAny(currentSchedule.start_date);
        return d ? formatVnDate(d) : currentSchedule.start_date;
      })()
    : "Đang cập nhật";

  const currentDestinationName =
    currentTour?.tour_destinations?.[0]?.locations?.name ||
    currentTour?.departure_locations?.name ||
    currentSchedule?.departure_location?.name ||
    "Việt Nam";

  const currentDurationDays = currentTour?.duration_days || 1;
  const currentDurationNights =
    currentTour?.duration_nights ?? Math.max(0, currentDurationDays - 1);
  const currentDurationText = `${currentDurationDays} ngày ${currentDurationNights} đêm`;

  const currentTransportName =
    currentSchedule?.tour_schedule_transports?.[0]?.transports?.name ||
    currentTour?.transports?.name ||
    "Xe du lịch";

  const currentPrice =
    unitPrice || currentSchedule?.price || currentTour?.base_price || 0;

  // Thông tin Tour đã đặt trước đó
  const priorDurationDays = priorTour?.durationDays || 1;
  const priorDurationNights =
    priorTour?.durationNights ?? Math.max(0, priorDurationDays - 1);
  const priorDurationText = `${priorDurationDays} ngày ${priorDurationNights} đêm`;

  return (
    <div
      id="conflictModal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-3 backdrop-blur-sm transition-opacity duration-200 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflictModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* MODAL CONTAINER (max-w-4xl, bo góc 24px, cố định chiều cao tối đa và layout flex) */}
      <div
        id="modalPanel"
        className="my-auto flex max-h-[90vh] w-full max-w-4xl flex-col transform rounded-[24px] border border-slate-100 bg-white shadow-2xl transition-all duration-200 animate-in fade-in zoom-in-95"
      >
        {/* 1. HEADER (Cố định ở đỉnh, không bị cuộn) */}
        <div className="flex shrink-0 items-start justify-between gap-4 p-5 pb-3 sm:items-center sm:p-7 sm:pb-4 md:p-8 md:pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h2
                id="conflictModalTitle"
                className="text-lg font-bold leading-snug text-slate-900 sm:text-xl"
              >
                Xác nhận trùng lịch trình tour
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Thời gian diễn ra của hai chuyến đi dưới đây đang bị giao nhau.
                Vui lòng đối chiếu trước khi tiếp tục.
              </p>
            </div>
          </div>

          {/* Nút đóng nhanh góc phải */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="shrink-0 cursor-pointer rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* PHẦN NỘI DUNG CUỘN (Scrollable Body) */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 md:px-8 space-y-5">
          {/* 2. SO SÁNH 2 TOUR TRÁI - PHẢI */}
          <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {/* Badge tròn nhỏ ở giữa 2 thẻ trên Desktop */}
            <div
              className="absolute left-1/2 top-1/2 z-10 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-orange-200 bg-white text-orange-600 shadow-md md:flex"
              title="Trùng thời gian khởi hành"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </div>

            {/* CỘT TRÁI: Tour đã đặt trước đó */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-slate-300">
              <div>
                {/* Thanh trạng thái trên cùng */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  {isSameAccount ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/90 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      Đơn trong tài khoản của bạn
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100/90 px-2.5 py-1 text-xs font-semibold text-purple-700">
                      <ShieldAlert className="h-3.5 w-3.5 text-purple-600" />
                      Đặt từ tài khoản khác
                    </span>
                  )}

                  {isSameAccount && priorTour?.bookingId ? (
                    <a
                      href={`/booking/${priorTour.bookingId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      title="Mở tab mới xem chi tiết đơn trong lịch sử"
                    >
                      <span>Xem đơn</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">
                      {isSameAccount
                        ? `Mã: ${priorTour?.tourCode || "TOUR-PREV"}`
                        : "Mã tour bảo mật"}
                    </span>
                  )}
                </div>

                {/* Thân thẻ: Ảnh bên trái + Thông tin bên phải */}
                <div className="flex gap-3.5">
                  {/* Thumbnail */}
                  <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-200 sm:w-32">
                    <img
                      src={
                        priorTour?.imageUrl ||
                        "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=400&q=80"
                      }
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://placehold.co/300x360/e2e8f0/475569?text=Tour";
                      }}
                      alt={priorTour?.tourName || "Tour đã đặt"}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-2 left-1.5 right-1.5 inline-flex items-center justify-center gap-1 truncate rounded-full bg-slate-900/70 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-200" />
                      <span className="truncate">
                        {priorTour?.destinationName || "Điểm đến"}
                      </span>
                    </span>
                  </div>

                  {/* Chi tiết Tour */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <span className="mb-1.5 inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                        <Globe className="h-3 w-3" />
                        {priorTour?.tourType === "international"
                          ? "Tour quốc tế"
                          : "Tour trong nước"}
                      </span>
                      <h3
                        className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 sm:text-[15px]"
                        title={priorTour?.tourName}
                      >
                        {priorTour?.tourName || "Tour đã đặt trước đó"}
                      </h3>
                    </div>

                    {/* Các thông số icon trực quan */}
                    <div className="my-2.5 space-y-1.5 text-xs">
                      {/* Khởi hành (Highlight màu cam) */}
                      <div className="flex items-center gap-2 rounded-lg border border-orange-200/80 bg-orange-50 px-2 py-1">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-orange-600" />
                        <span className="text-orange-700">Khởi hành:</span>
                        <strong className="ml-auto font-bold text-orange-700">
                          {priorTour?.startDate || "Đang cập nhật"}
                        </strong>
                      </div>

                      {/* Thời gian & Phương tiện */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="flex items-center gap-1.5 truncate rounded-lg border border-slate-200/70 bg-white px-2 py-1">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                          <span className="truncate font-medium text-slate-700">
                            {priorDurationText}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate rounded-lg border border-slate-200/70 bg-white px-2 py-1">
                          <Plane className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                          <span
                            className="truncate font-medium text-slate-700"
                            title={priorTour?.transportName || "Xe du lịch"}
                          >
                            {priorTour?.transportName || "Xe du lịch"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Đánh giá sao & Giá tiền */}
              <div className="mt-1 flex items-center justify-between border-t border-slate-200/70 pt-3">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>
                    {priorTour?.ratingAvg && Number(priorTour.ratingAvg) > 0
                      ? `${Number(priorTour.ratingAvg).toFixed(1)}${priorTour.ratingCount ? ` (${priorTour.ratingCount})` : ""}`
                      : "Chưa có đánh giá"}
                  </span>
                </div>
                <div className="text-right">
                  {isSameAccount ? (
                    priorTour?.price ? (
                      <>
                        <span className="text-base font-extrabold text-slate-900">
                          {Number(priorTour.price).toLocaleString("vi-VN")} đ
                        </span>
                        <span className="text-xs text-slate-400"> / người</span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-slate-500">
                        Đã thanh toán
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1 text-xs font-medium text-slate-500">
                      <Lock className="h-3 w-3 text-slate-400" />
                      Giá vé bảo mật
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: Tour đang chọn đặt */}
            <div className="relative flex flex-col justify-between rounded-2xl border-2 border-orange-300 bg-white p-4 shadow-sm">
              <div>
                {/* Thanh trạng thái trên cùng */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                    Tour đang chọn đặt
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    Mã: {currentTour?.code || "MỚI"}
                  </span>
                </div>

                {/* Thân thẻ: Ảnh bên trái + Thông tin bên phải */}
                <div className="flex gap-3.5">
                  {/* Thumbnail */}
                  <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-200 sm:w-32">
                    <img
                      src={
                        currentSchedule?.cover_image_url ||
                        currentTour?.tour_images?.[0]?.image_url ||
                        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80"
                      }
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://placehold.co/300x360/ffedd5/c2410c?text=Tour";
                      }}
                      alt={currentTour?.name || "Tour đang đặt"}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-2 left-1.5 right-1.5 inline-flex items-center justify-center gap-1 truncate rounded-full bg-slate-900/70 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-200" />
                      <span className="truncate">{currentDestinationName}</span>
                    </span>
                  </div>

                  {/* Chi tiết Tour */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <span className="mb-1.5 inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                        <Globe className="h-3 w-3" />
                        {currentTour?.tour_type === "international"
                          ? "Tour quốc tế"
                          : "Tour trong nước"}
                      </span>
                      <h3
                        className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 sm:text-[15px]"
                        title={currentTour?.name}
                      >
                        {currentTour?.name || "Tour đang chọn đặt"}
                      </h3>
                    </div>

                    {/* Các thông số icon trực quan */}
                    <div className="my-2.5 space-y-1.5 text-xs">
                      {/* Khởi hành (Highlight màu cam) */}
                      <div className="flex items-center gap-2 rounded-lg border border-orange-200/80 bg-orange-50 px-2 py-1">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-orange-600" />
                        <span className="text-orange-700">Khởi hành:</span>
                        <strong className="ml-auto font-bold text-orange-700">
                          {currentStartDateStr}
                        </strong>
                      </div>

                    {/* Thời gian & Phương tiện */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-1.5 truncate rounded-lg border border-slate-200/70 bg-slate-50 px-2 py-1">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                        <span className="truncate font-medium text-slate-700">
                          {currentDurationText}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate rounded-lg border border-slate-200/70 bg-slate-50 px-2 py-1">
                        <Plane className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                        <span
                          className="truncate font-medium text-slate-700"
                          title={currentTransportName}
                        >
                          {currentTransportName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Đánh giá sao & Giá tiền */}
            <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>
                  {currentTour?.rating_avg && Number(currentTour.rating_avg) > 0
                    ? `${Number(currentTour.rating_avg).toFixed(1)}${currentTour.rating_count ? ` (${currentTour.rating_count})` : ""}`
                    : "Chưa có đánh giá"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-blue-600">
                  {Number(currentPrice).toLocaleString("vi-VN")} đ
                </span>
                <span className="text-xs text-slate-400"> / người</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. LÝ DO TRÙNG LỊCH & DANH SÁCH HÀNH KHÁCH */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-4 sm:p-5">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold sm:text-sm">
              {isSameAccount ? (
                <>
                  <Users className="h-4 w-4 shrink-0 text-blue-600" />
                  <span className="text-blue-900">
                    Lý do cảnh báo: Bạn đang có chuyến đi trùng lịch trong tài khoản
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4 shrink-0 text-orange-600" />
                  <span className="text-orange-900">
                    Lý do cảnh báo: Hành khách đã có lịch đi từ một người/tài khoản khác
                  </span>
                </>
              )}
            </div>
            {overlapRangeStr && (
              <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-2.5 py-1 text-xs font-semibold text-orange-700">
                <CalendarRange className="h-3.5 w-3.5 text-orange-500" />
                Giao nhau: {overlapRangeStr}
              </span>
            )}
          </div>

          {/* Lời nhắc thông minh theo kịch bản cùng / khác tài khoản */}
          {!isSameAccount ? (
            <div className="mb-3 rounded-xl border border-orange-200/80 bg-white/90 p-3 text-xs text-slate-700 shadow-xs">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                <div className="space-y-1.5 leading-relaxed">
                  <p>
                    • <strong>Có thể được người thân/bạn bè đặt trước:</strong> Hành
                    khách này đã được đăng ký chuyến đi trên bởi một người khác. Vui
                    lòng liên hệ lại với hành khách để xác nhận.
                  </p>
                  <p>
                    • <strong>Kiểm tra lại số CCCD:</strong> Nếu bạn không quen biết
                    chuyến đi kia, có khả năng bạn đã <strong>gõ nhầm số CCCD</strong>.
                    Hãy bấm nút <strong>&ldquo;Kiểm tra lại&rdquo;</strong> bên dưới
                    để chỉnh sửa.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mb-3 text-xs text-slate-600 sm:text-sm">
              Bạn đã đăng ký hành khách dưới đây cho chuyến đi trước đó. Vui lòng đối
              chiếu thời gian trước khi xác nhận đặt thêm:
            </p>
          )}

          <ul className="max-h-48 space-y-2 overflow-y-auto pr-1 text-xs text-slate-700 sm:text-sm">
            {uniqueTravelers.map((t, idx) => (
              <li
                key={idx}
                className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-orange-100 bg-white/80 px-3 py-2 text-xs sm:text-sm"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                <span>
                  Hành khách{" "}
                  <strong className="font-semibold text-slate-900">
                    {t.travelerName}
                  </strong>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">
                  CCCD:{" "}
                  <code className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-800">
                    {t.idNumber || "Chưa có"}
                  </code>
                </span>
                {/* Khi cùng tài khoản: hiển thị thêm Giới tính và Ngày sinh */}
                {isSameAccount && (
                  <>
                    {t.gender && (
                      <>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">
                          Giới tính:{" "}
                          <strong className="font-medium text-slate-800">
                            {formatGender(t.gender)}
                          </strong>
                        </span>
                      </>
                    )}
                    {t.birthday && (
                      <>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">
                          Ngày sinh:{" "}
                          <strong className="font-medium text-slate-800">
                            {formatBirthday(t.birthday)}
                          </strong>
                        </span>
                      </>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. FOOTER ACTIONS (Cố định ở đáy, không bị cuộn, các nút không bị co ép chữ) */}
      <div className="flex shrink-0 flex-col items-center justify-between gap-3 border-t border-slate-100 p-5 pt-4 sm:flex-row sm:gap-4 sm:p-7 sm:pt-4 md:p-8 md:pt-4">
        <p className="flex-1 min-w-0 pr-2 text-center text-xs font-medium text-slate-600 sm:text-left sm:text-sm">
          {isSameAccount
            ? "Bạn có xác nhận vẫn muốn tiếp tục đặt thêm tour mới này không?"
            : "Bạn đã xác nhận với hành khách (hoặc CCCD đã chuẩn xác) và vẫn muốn tiếp tục đặt?"}
        </p>

        <div className="flex shrink-0 items-center justify-end gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 shrink-0 cursor-pointer whitespace-nowrap rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-[0.99] sm:flex-initial"
          >
            Kiểm tra lại
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 shrink-0 cursor-pointer whitespace-nowrap rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700 active:scale-[0.99] sm:flex-initial"
          >
            Xác nhận vẫn muốn đặt
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}
