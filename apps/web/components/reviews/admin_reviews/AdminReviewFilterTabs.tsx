"use client";

import { Search, Star, X } from "lucide-react";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";

export type ReviewStatusFilter = "all" | "0" | "1" | "2";

interface ReviewFilterTabsProps {
  activeStatus: ReviewStatusFilter;
  onStatusChange: (status: ReviewStatusFilter) => void;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  ratingFilter: number | "all";
  onRatingChange: (rating: number | "all") => void;
  sortBy: "newest" | "oldest" | "highest" | "lowest";
  onSortChange: (sort: "newest" | "oldest" | "highest" | "lowest") => void;
}

export function ReviewFilterTabs({
  activeStatus,
  onStatusChange,
  pendingCount,
  approvedCount,
  rejectedCount,
  totalCount,
  searchQuery,
  onSearchChange,
  ratingFilter,
  onRatingChange,
  sortBy,
  onSortChange,
}: ReviewFilterTabsProps) {
  const tabs: { id: ReviewStatusFilter; label: string; count: number; color?: string }[] = [
    { id: "all", label: "Tất cả", count: totalCount },
    { id: "0", label: "Chờ duyệt", count: pendingCount, color: "bg-amber-100 text-amber-800" },
    { id: "1", label: "Đã duyệt", count: approvedCount, color: "bg-emerald-100 text-emerald-800" },
    { id: "2", label: "Đã từ chối / Ẩn", count: rejectedCount, color: "bg-rose-100 text-rose-800" },
  ];

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      {/* Status tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => {
            const isActive = activeStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : tab.color || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sắp xếp */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-medium">Sắp xếp:</span>
          <CustomDropdown
            ariaLabel="Sắp xếp đánh giá"
            selectedValue={sortBy}
            options={[
              { value: "newest", label: "Mới nhất trước" },
              { value: "oldest", label: "Cũ nhất trước" },
              { value: "highest", label: "Đánh giá cao nhất" },
              { value: "lowest", label: "Đánh giá thấp nhất" },
            ]}
            onSelect={(value) => onSortChange(value as ReviewFilterTabsProps["sortBy"])}
            variant="compact"
            matchTriggerWidth
            className="w-[184px] [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:rounded-lg [&_button[aria-haspopup=listbox]]:border-blue-500 [&_button[aria-haspopup=listbox]]:bg-white [&_button[aria-haspopup=listbox]]:px-3 [&_button[aria-haspopup=listbox]]:py-2 [&_button[aria-haspopup=listbox]]:text-xs [&_button[aria-haspopup=listbox]]:font-medium [&_button[aria-haspopup=listbox]]:shadow-none"
          />
        </div>
      </div>

      {/* Search and star rating filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên khách hàng, mã/tên tour, nội dung đánh giá..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-9 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Rating filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap mr-1">
            Số sao:
          </span>
          <button
            type="button"
            onClick={() => onRatingChange("all")}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
              ratingFilter === "all"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Tất cả
          </button>
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() => onRatingChange(stars)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                ratingFilter === stars
                  ? "bg-amber-50 text-amber-800 border border-amber-300"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{stars}</span>
              <Star size={12} className="fill-amber-400 text-amber-500" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

