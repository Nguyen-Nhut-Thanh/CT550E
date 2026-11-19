"use client";

import { AdminStatCard } from "@/components/common/admin_shared/cards/AdminStatCard";

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
    <div className="space-y-3">
      {/* Tour & Schedule Overview KPIs */}
      <div className="grid grid-cols-4 gap-3 @max-[1180px]/analytics:grid-cols-2 @max-[650px]/analytics:grid-cols-1">
        <AdminStatCard title="Tổng danh mục Tour" value={`${tours.totalTours} Tour`} description={`Có ${tours.activeTours} tour đang mở bán`} icon={Compass} />
        <AdminStatCard title="Lịch khởi hành" value={`${tours.totalSchedules} Chuyến`} description={`Có ${tours.completedSchedules} chuyến đã hoàn thành`} icon={CalendarDays} tone="green" />
        <AdminStatCard title="Tour bán chạy nhất" value={<span className="block truncate" title={tours.topTours[0]?.name}>{tours.topTours[0]?.name || "Chưa có"}</span>} description={`Đạt ${tours.topTours[0]?.bookingsCount || 0} lượt đặt`} icon={Trophy} tone="amber" />
        <AdminStatCard title="Phân loại thị trường" value={`${tours.byType.length} Tuyến`} description="Trong nước, Ngoài nước & Quốc tế" icon={Globe2} tone="purple" />
      </div>

      {/* Tour by Type Cards */}
      <div>
        <h4 className="text-[16px] font-[750] leading-[1.5] text-[#0b1747] mb-3">
          Cơ Cấu Doanh Thu & Booking Theo Loại Tour
        </h4>
        <div className="grid grid-cols-3 gap-3 @max-[900px]/analytics:grid-cols-2 @max-[650px]/analytics:grid-cols-1">
          {tours.byType.map((t) => {
            const Icon = typeIcons[t.type] || Plane;
            const pct = Math.round((t.revenue / totalTypeRevenue) * 100);
            return (
              <AdminStatCard key={t.type} title={t.label} value={formatVND(t.revenue)} icon={Icon}
                description={`${t.count} sản phẩm tour · ${t.bookingsCount} đơn`}
                badge={<span className="rounded-full border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-blue-700">{pct}% DS</span>}
              >
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(pct,100)}%` }} /></div>
              </AdminStatCard>
            );
          })}
        </div>
      </div>

      {/* Top 10 Best-selling Tours Table */}
      <div className="min-w-0 rounded-[14px] border border-[#e1edfc] bg-white overflow-hidden">
        <div className="p-4 border-b border-[#edf2fb] flex items-center justify-between">
          <div>
            <h4 className="text-[16px] font-[750] leading-[1.5] text-[#0b1747]">
              Top 10 Tour Du Lịch Bán Chạy & Doanh Thu Cao Nhất
            </h4>
            <p className="text-xs text-[#7387aa]">
              Danh sách xếp hạng theo mức đóng góp dòng tiền vào hệ thống trong kỳ
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f4f8fd] text-[12px] text-[#657b9f] border-b border-[#e1edfc] font-semibold ">
              <tr>
                <th className="py-3 px-4 text-center w-12">Hạng</th>
                <th className="py-3 px-4">Thông tin Tour</th>
                <th className="py-3 px-4 text-center">Đánh giá</th>
                <th className="py-3 px-4 text-center">Lượt đặt</th>
                <th className="py-3 px-4 text-right">Doanh thu tạo ra</th>
                <th className="py-3 px-4 text-right">Giá khởi điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2fb] font-medium text-slate-700">
              {tours.topTours.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-60 p-6 text-center text-[#7387aa]">
                    Chưa có số liệu tour bán chạy trong kỳ này
                  </td>
                </tr>
              ) : (
                tours.topTours.map((item, idx) => (
                  <tr key={item.tourId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                          idx === 0
                            ? "bg-amber-100 text-amber-800"
                            : idx === 1
                            ? "bg-slate-200 text-[#0b1747]"
                            : idx === 2
                            ? "bg-orange-100 text-orange-800"
                            : "bg-slate-100 text-[#7387aa]"
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
                          <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#7387aa] text-[10px]">
                            Ảnh Tour
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[#0b1747] line-clamp-1">{item.name}</p>
                          <span className="font-mono text-[11px] text-[#7387aa]">
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
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      {formatVND(item.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-[#7387aa]">
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

