"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MoreHorizontal, User } from "lucide-react";
import { formatVND } from "@/lib/client/utils/utils";
import type {
  AccountBookingsTabProps,
  BookingItemUI,
  BookingStatusFilter,
} from "shared";

export function AccountBookingsTab({ bookings = [] }: AccountBookingsTabProps) {
  const [activeFilter, setActiveFilter] = useState<BookingStatusFilter>("all");

  const formattedBookings: BookingItemUI[] = useMemo(() => {
    if (bookings && bookings.length > 0) {
      return bookings.map((b) => {
        const id = b.booking_id;
        const name = b.tour_schedules?.tours?.name || `Đơn đặt tour #${b.booking_id}`;
        const startDate = b.tour_schedules?.start_date
          ? new Date(b.tour_schedules.start_date).toLocaleDateString("vi-VN")
          : "Chưa xác định";
        const endDate = b.tour_schedules?.end_date
          ? new Date(b.tour_schedules.end_date).toLocaleDateString("vi-VN")
          : "Chưa xác định";

        const passParts: string[] = [];
        if (b.adult_count) passParts.push(`${b.adult_count} người lớn`);
        if (b.child_count) passParts.push(`${b.child_count} trẻ em`);
        if (b.infant_count) passParts.push(`${b.infant_count} em bé`);
        const passengers = passParts.join(", ") || "1 người lớn";

        const st = (b.status || "").toLowerCase();
        let status: "completed" | "upcoming" | "cancelled" = "completed";
        let statusText = "Đã hoàn thành";

        if (st.includes("hủy") || st.includes("cancel")) {
          status = "cancelled";
          statusText = "Đã hủy";
        } else if (st.includes("chờ") || st.includes("mới") || st.includes("pending") || st.includes("upcoming")) {
          status = "upcoming";
          statusText = "Sắp diễn ra";
        }

        const price = b.total_amount ? Number(b.total_amount) : 2890000;
        const image =
          b.tour_schedules?.tours?.tour_images?.[0]?.image_url ||
          "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600";

        return {
          id,
          name,
          startDate,
          endDate,
          passengers,
          status,
          statusText,
          price,
          image,
        };
      });
    }

    return [];
  }, [bookings]);

  const upcomingCount = useMemo(
    () => formattedBookings.filter((b) => b.status === "upcoming").length,
    [formattedBookings]
  );
  const completedCount = useMemo(
    () => formattedBookings.filter((b) => b.status === "completed").length,
    [formattedBookings]
  );
  const cancelledCount = useMemo(
    () => formattedBookings.filter((b) => b.status === "cancelled").length,
    [formattedBookings]
  );

  const filteredList = useMemo(() => {
    if (activeFilter === "all") return formattedBookings;
    return formattedBookings.filter((b) => b.status === activeFilter);
  }, [formattedBookings, activeFilter]);

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Lịch sử đặt tour</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Danh sách các tour bạn đã đặt và tình trạng hiện tại
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
            activeFilter === "all"
              ? "bg-[#1766c2] text-white shadow-sm"
              : "bg-slate-100/90 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Tất cả ({formattedBookings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("upcoming")}
          className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
            activeFilter === "upcoming"
              ? "bg-[#1766c2] text-white shadow-sm"
              : "bg-slate-100/90 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Sắp diễn ra ({upcomingCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("completed")}
          className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
            activeFilter === "completed"
              ? "bg-[#1766c2] text-white shadow-sm"
              : "bg-slate-100/90 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Đã hoàn thành ({completedCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("cancelled")}
          className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
            activeFilter === "cancelled"
              ? "bg-[#1766c2] text-white shadow-sm"
              : "bg-slate-100/90 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Đã hủy ({cancelledCount})
        </button>
      </div>

      {/* Booking Cards List */}
      {filteredList.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">Chưa có đơn đặt tour nào trong mục này</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              {/* Left Side: Thumbnail & Infos */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative aspect-[16/10] w-36 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>

                <div className="space-y-1.5 min-w-0">
                  <h3 className="text-base font-extrabold text-slate-900 truncate">
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{item.startDate} - {item.endDate}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{item.passengers}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Status, Price & Action Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Status & Price */}
                <div className="text-left sm:text-right space-y-1">
                  <div>
                    {item.status === "completed" && (
                      <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        {item.statusText}
                      </span>
                    )}
                    {item.status === "upcoming" && (
                      <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                        {item.statusText}
                      </span>
                    )}
                    {item.status === "cancelled" && (
                      <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                        {item.statusText}
                      </span>
                    )}
                  </div>

                  <div className="text-base font-extrabold text-slate-900 sm:text-lg">
                    {formatVND(item.price)}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/booking/result?booking_id=${item.id}`}
                    className="rounded-xl bg-[#eef6ff] px-4 py-2.5 text-xs font-bold text-[#1766c2] transition hover:bg-blue-100"
                  >
                    Xem chi tiết
                  </Link>

                  <button
                    type="button"
                    aria-label="Tùy chọn khác"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
