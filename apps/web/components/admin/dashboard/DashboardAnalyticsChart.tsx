"use client";

import { formatVND } from "@/lib/utils/currency";
import { BarChart2, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { DashboardAnalyticsChartProps } from 'shared';

export function DashboardAnalyticsChart({ chart }: DashboardAnalyticsChartProps) {
  const [activeTab, setActiveTab] = useState<"revenue" | "bookings">("revenue");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!chart || chart.length === 0) {
    return (
      <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm">
        <BarChart2 className="h-10 w-10 text-slate-300" />
        <p className="mt-2 text-sm font-semibold text-slate-500">Chưa có dữ liệu biểu đồ trong khoảng thời gian này.</p>
      </div>
    );
  }

  // Values based on active tab
  const values = chart.map((p) => (activeTab === "revenue" ? p.revenue : p.bookings));
  const maxValue = Math.max(...values, 1);
  const totalValue = values.reduce((sum, v) => sum + v, 0);
  const avgValue = Math.round(totalValue / values.length);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 240;
  const paddingX = 40;
  const paddingY = 30;
  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingY * 2;

  // Compute point coordinates
  const points = chart.map((p, i) => {
    const val = activeTab === "revenue" ? p.revenue : p.bookings;
    const x =
      chart.length === 1
        ? svgWidth / 2
        : paddingX + (i / (chart.length - 1)) * innerWidth;
    const y = svgHeight - paddingY - (val / maxValue) * innerHeight;
    return { x, y, point: p, val };
  });

  // Construct SVG smooth path or straight line path
  const linePath = points.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    // Simple smooth bezier curve
    const prev = points[idx - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, "");

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : "";

  const hoveredItem = hoveredIndex !== null ? points[hoveredIndex] ?? null : null;

  return (
    <div className="rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm">
      {/* Chart Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp size={18} />
            </div>
            <h2 className="text-base font-black tracking-tight text-slate-900">
              Xu Hướng Tăng Trưởng
            </h2>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Biểu đồ diễn biến doanh thu và lượng đặt theo các mốc thời gian đã chọn.
          </p>
        </div>

        {/* Tab switcher & Metric Summary */}
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("revenue");
                setHoveredIndex(null);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "revenue"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <DollarSign size={14} />
              Doanh thu
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("bookings");
                setHoveredIndex(null);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "bookings"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart2 size={14} />
              Lượt đặt
            </button>
          </div>
        </div>
      </div>

      {/* Mini summary badges */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 font-medium text-slate-600">
          <span className="text-slate-400">Trung bình:</span>
          <span className="font-bold text-slate-900">
            {activeTab === "revenue" ? formatVND(avgValue) : `${avgValue} đơn/mốc`}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 font-medium text-slate-600">
          <span className="text-slate-400">Đỉnh điểm:</span>
          <span className="font-bold text-blue-600">
            {activeTab === "revenue" ? formatVND(maxValue) : `${maxValue} đơn`}
          </span>
        </div>
        {hoveredItem && (
          <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 animate-fadeIn">
            <span>{hoveredItem.point.label}:</span>
            <span>
              {activeTab === "revenue"
                ? formatVND(hoveredItem.val)
                : `${hoveredItem.val} đơn`}
            </span>
          </div>
        )}
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div className="relative mt-3 w-full select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="h-auto min-h-40 w-full overflow-visible"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid guide lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = svgHeight - paddingY - ratio * innerHeight;
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <text key={ratio} x={paddingX - 8} y={svgHeight - paddingY - ratio * innerHeight + 4} textAnchor="end" fontSize="10" fill="#7b8eaf">
              {activeTab === "revenue"
                ? new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(maxValue * ratio)
                : Math.round(maxValue * ratio)}
            </text>
          ))}

          {/* Area fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill={activeTab === "revenue" ? "url(#revenueGradient)" : "url(#bookingsGradient)"}
              className="transition-all duration-500"
            />
          )}

          {/* Main line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={activeTab === "revenue" ? "#2563eb" : "#059669"}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500"
            />
          )}

          {/* Data point dots & interactive vertical hover zones */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Wide invisible click/hover target */}
                <rect
                  x={pt.x - 12}
                  y={0}
                  width={24}
                  height={svgHeight}
                  fill="transparent"
                />

                {/* Vertical hover crosshair indicator */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingY}
                    x2={pt.x}
                    y2={svgHeight - paddingY}
                    stroke={activeTab === "revenue" ? "#93c5fd" : "#6ee7b7"}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Outer halo */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : 4}
                  fill="#ffffff"
                  stroke={activeTab === "revenue" ? "#2563eb" : "#059669"}
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          {/* X Axis Bottom Labels (show selective labels to avoid clutter) */}
          {points.map((pt, idx) => {
            const step = Math.ceil(points.length / 8);
            const isVisible = idx % step === 0 || idx === points.length - 1;
            if (!isVisible) return null;

            return (
              <text
                key={idx}
                x={pt.x}
                y={svgHeight - 10}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#94a3b8"
              >
                {pt.point.label}
              </text>
            );
          })}
        </svg>

        {/* Floating tooltip box */}
        {hoveredItem && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full transform rounded-2xl border border-slate-200 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-md"
            style={{
              left: `${(hoveredItem.x / svgWidth) * 100}%`,
              top: `${(hoveredItem.y / svgHeight) * 100}%`,
            }}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <Calendar size={12} />
              {hoveredItem.point.label}
            </div>
            <div className="mt-1 text-sm font-black text-white">
              {activeTab === "revenue"
                ? formatVND(hoveredItem.point.revenue)
                : `${hoveredItem.point.bookings} đơn đặt`}
            </div>
            <div className="mt-0.5 text-[11px] font-medium text-slate-300">
              {activeTab === "revenue"
                ? `${hoveredItem.point.bookings} đơn đặt phòng`
                : formatVND(hoveredItem.point.revenue)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
