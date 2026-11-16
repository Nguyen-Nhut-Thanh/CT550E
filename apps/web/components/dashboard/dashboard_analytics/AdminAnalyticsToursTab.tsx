"use client";

import { formatVND } from "@/lib/utils/currency";
import {
  CalendarDays,
  Compass,
  Globe2,
  MapPin,
  Plane,
  Star,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import type { ComprehensiveAnalytics } from "shared";

interface AnalyticsToursTabProps {
  data: ComprehensiveAnalytics;
}

export function AnalyticsToursTab({ data }: AnalyticsToursTabProps) {
  const { tours } = data;

  const typeIcons: Record<string, typeof Plane> = {
    domestic: MapPin,
    outbound: Plane,
    inbound: Globe2,
  };

  const totalTypeRevenue = tours.byType.reduce((sum, t) => sum + t.revenue, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Tour & Schedule Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Compass size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tổng danh mục Tour
              </p>
              <h4 className="text-xl font-black text-slate-900">{tours.totalTours} Tour</h4>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Có <span className="font-bold text-blue-600">{tours.activeTours} tour</span> đang mở bán
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Lịch khởi hành
              </p>
              <h4 className="text-xl font-black text-slate-900">{tours.totalSchedules} Chuyến</h4>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Có <span className="font-bold text-emerald-600">{tours.completedSchedules} chuyến</span> đã hoàn thành
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tour bán chạy nhất
              </p>
              <h4 className="text-sm font-black text-slate-900 truncate max-w-44">
                {tours.topTours[0]?.name || "Chưa có"}
              </h4>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Đạt <span className="font-bold text-amber-600">{tours.topTours[0]?.bookingsCount || 0} lượt đặt</span>
          </p>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Globe2 size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Phân loại thị trường
              </p>
              <h4 className="text-xl font-black text-slate-900">{tours.byType.length} Tuyến</h4>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Trong nước, Ngoài nước & Quốc tế</p>
        </div>
      </div>

      {/* Tour by Type Cards */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3">
          Cơ Cấu Doanh Thu & Booking Theo Loại Tour
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tours.byType.map((t) => {
            const Icon = typeIcons[t.type] || Plane;
            const pct = Math.round((t.revenue / totalTypeRevenue) * 100);
            return (
              <div
                key={t.type}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">{t.label}</h5>
                      <span className="text-[11px] text-slate-400">{t.count} sản phẩm tour</span>
                    </div>
                  </div>
                  <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-black text-blue-700">
                    {pct}% DS
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Doanh thu ghi nhận:</span>
                  <span className="text-base font-black text-slate-900">
                    {formatVND(t.revenue)}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
                  <span>Lượt đặt vé:</span>
                  <span className="font-bold text-slate-700">{t.bookingsCount} đơn</span>
                </div>

                <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 10 Best-selling Tours Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Top 10 Tour Du Lịch Bán Chạy & Doanh Thu Cao Nhất
            </h4>
            <p className="text-xs text-slate-500">
              Danh sách xếp hạng theo mức đóng góp dòng tiền vào hệ thống trong kỳ
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200/70 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-center w-12">Hạng</th>
                <th className="py-3 px-4">Thông tin Tour</th>
                <th className="py-3 px-4 text-center">Đánh giá</th>
                <th className="py-3 px-4 text-center">Lượt đặt</th>
                <th className="py-3 px-4 text-right">Doanh thu tạo ra</th>
                <th className="py-3 px-4 text-right">Giá khởi điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {tours.topTours.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Chưa có số liệu tour bán chạy trong kỳ này
                  </td>
                </tr>
              ) : (
                tours.topTours.map((item, idx) => (
                  <tr key={item.tourId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black ${
                          idx === 0
                            ? "bg-amber-100 text-amber-800"
                            : idx === 1
                            ? "bg-slate-200 text-slate-800"
                            : idx === 2
                            ? "bg-orange-100 text-orange-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {item.featuredImage ? (
                          <div className="relative h-10 w-14 shrink-0 rounded-lg overflow-hidden border border-slate-200">
                            <Image
                              src={item.featuredImage}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 text-[10px]">
                            Ảnh Tour
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                          <span className="font-mono text-[11px] text-slate-400">
                            #{item.code}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 text-amber-500 font-bold">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span>{item.rating ? item.rating.toFixed(1) : "5.0"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
                        {item.bookingsCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-600">
                      {formatVND(item.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {item.priceFrom ? formatVND(item.priceFrom) : "Liên hệ"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

