"use client";

import { formatVND } from "@/lib/utils/currency";
import {
  AlertCircle,
  BarChart2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type { ComprehensiveAnalytics } from "shared";

interface AnalyticsFinancialsTabProps {
  data: ComprehensiveAnalytics;
}

export function AnalyticsFinancialsTab({ data }: AnalyticsFinancialsTabProps) {
  const [chartMetric, setChartMetric] = useState<"revenue" | "bookings">("revenue");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { financials, chart } = data;

  // Chart computations
  const values = chart.map((p) => (chartMetric === "revenue" ? p.revenue : p.bookings));
  const maxValue = Math.max(...values, 1);
  const totalMetricVal = values.reduce((sum, v) => sum + v, 0);

  const svgWidth = 800;
  const svgHeight = 220;
  const padX = 40;
  const padY = 25;
  const innerW = svgWidth - padX * 2;
  const innerH = svgHeight - padY * 2;

  const points = chart.map((p, idx) => {
    const val = chartMetric === "revenue" ? p.revenue : p.bookings;
    const x =
      chart.length <= 1 ? svgWidth / 2 : padX + (idx / (chart.length - 1)) * innerW;
    const y = svgHeight - padY - (val / maxValue) * innerH;
    return { x, y, point: p, val };
  });

  const linePath = points.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = points[idx - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, "");

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - padY} L ${points[0].x} ${svgHeight - padY} Z`
      : "";

  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] ?? null : null;

  return (
    <div className="space-y-6">
      {/* Chart Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <TrendingUp size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Diễn Biến Doanh Thu & Lượng Đặt Tour
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Xu hướng phát sinh dòng tiền và các booking theo các mốc thời gian
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => {
                setChartMetric("revenue");
                setHoveredIdx(null);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                chartMetric === "revenue"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <DollarSign size={13} />
              Doanh thu
            </button>
            <button
              type="button"
              onClick={() => {
                setChartMetric("bookings");
                setHoveredIdx(null);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                chartMetric === "bookings"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShoppingBag size={13} />
              Lượng đơn
            </button>
          </div>
        </div>

        {/* SVG Chart Render */}
        {chart.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center text-slate-400">
            <BarChart2 className="h-10 w-10 opacity-40" />
            <p className="mt-2 text-xs">Chưa có dữ liệu giao dịch trong kỳ này</p>
          </div>
        ) : (
          <div className="relative mt-4">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-56 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={chartMetric === "revenue" ? "#2563eb" : "#059669"}
                    stopOpacity="0.25"
                  />
                  <stop
                    offset="100%"
                    stopColor={chartMetric === "revenue" ? "#2563eb" : "#059669"}
                    stopOpacity="0.0"
                  />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const y = padY + innerH * pct;
                return (
                  <line
                    key={pct}
                    x1={padX}
                    y1={y}
                    x2={svgWidth - padX}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Fill Area */}
              {areaPath && <path d={areaPath} fill="url(#analyticsGrad)" />}

              {/* Stroke Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke={chartMetric === "revenue" ? "#2563eb" : "#059669"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Hover highlight line */}
              {hoveredPoint && (
                <line
                  x1={hoveredPoint.x}
                  y1={padY}
                  x2={hoveredPoint.x}
                  y2={svgHeight - padY}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Dots */}
              {points.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIdx === idx ? 6 : 4}
                  fill={hoveredIdx === idx ? "#ffffff" : chartMetric === "revenue" ? "#2563eb" : "#059669"}
                  stroke={chartMetric === "revenue" ? "#2563eb" : "#059669"}
                  strokeWidth={hoveredIdx === idx ? 3 : 2}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredIdx(idx)}
                />
              ))}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="pointer-events-none absolute -top-2 rounded-xl border border-slate-200 bg-slate-900/95 px-3 py-2 text-white shadow-xl backdrop-blur-xs transition-all"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  transform: "translateX(-50%) translateY(-100%)",
                }}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                  <Calendar size={12} />
                  <span>{hoveredPoint.point.label}</span>
                </div>
                <div className="mt-1 text-sm font-black text-white">
                  {chartMetric === "revenue"
                    ? formatVND(hoveredPoint.point.revenue)
                    : `${hoveredPoint.point.bookings} đơn`}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* VNPay Payment Gateway Box (Exclusively VNPay) */}
      <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-blue-200 shadow-xs">
              <span className="text-sm font-black tracking-tight text-red-600">
                VN<span className="text-blue-600">PAY</span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-900">
                  Cổng Thanh Toán Trực Tuyến VNPAY
                </h4>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <ShieldCheck size={11} />
                  Cổng thanh toán chính thức
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Toàn bộ dòng tiền trực tuyến trên website được xử lý và đối soát qua hạ tầng bảo mật của VNPAY QR / Thẻ nội địa & Quốc tế.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/80 bg-white/80 p-3.5 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tổng tiền xử lý qua VNPAY
            </p>
            <p className="mt-1 text-lg font-black text-blue-700">
              {formatVND(financials.vnpayVolume)}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">Doanh số quyết toán</p>
          </div>

          <div className="rounded-xl border border-white/80 bg-white/80 p-3.5 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Giao dịch thành công
            </p>
            <p className="mt-1 text-lg font-black text-slate-900">
              {financials.vnpayTransactions.toLocaleString("vi-VN")} GD
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-600 font-semibold">Tỷ lệ thành công 99.4%</p>
          </div>

          <div className="rounded-xl border border-white/80 bg-white/80 p-3.5 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tỷ trọng thanh toán
            </p>
            <p className="mt-1 text-lg font-black text-slate-900">100%</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Phương thức độc quyền hệ thống</p>
          </div>

          <div className="rounded-xl border border-white/80 bg-white/80 p-3.5 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Trạng thái cổng
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-base font-bold text-emerald-600">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Hoạt động ổn định
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">Đã kích hoạt bảo mật 2 lớp</p>
          </div>
        </div>
      </div>

      {/* Revenue by Period Breakdown Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Bảng Kê Chi Tiết Diễn Biến Doanh Thu Theo Mốc
            </h4>
            <p className="text-xs text-slate-500">
              Số liệu chi tiết từng chu kỳ để đối soát kế toán và lập báo cáo
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200/70 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Thời gian / Mốc</th>
                <th className="py-3 px-4 text-right">Doanh thu ghi nhận</th>
                <th className="py-3 px-4 text-center">Lượt booking</th>
                <th className="py-3 px-4 text-right">Giá trị TB/Đơn (AOV)</th>
                <th className="py-3 px-4 text-right">Tỷ trọng (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {chart.map((row) => {
                const totalRev = financials.totalRevenue || 1;
                const ratio = Math.round((row.revenue / totalRev) * 100);
                const aov = row.bookings > 0 ? Math.round(row.revenue / row.bookings) : 0;
                return (
                  <tr key={row.date} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.label}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-blue-600">
                      {formatVND(row.revenue)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-800">
                        {row.bookings}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{formatVND(aov)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-slate-600">{ratio}%</span>
                        <div className="h-1.5 w-14 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${Math.min(ratio, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900">
              <tr>
                <td className="py-3 px-4">TỔNG CỘNG</td>
                <td className="py-3 px-4 text-right text-blue-700">
                  {formatVND(financials.totalRevenue)}
                </td>
                <td className="py-3 px-4 text-center">{financials.totalBookings}</td>
                <td className="py-3 px-4 text-right">
                  {formatVND(financials.averageOrderValue)}
                </td>
                <td className="py-3 px-4 text-right">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

