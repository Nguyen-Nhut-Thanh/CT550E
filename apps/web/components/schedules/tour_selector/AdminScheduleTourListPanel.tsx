"use client";

import { TourListSkeleton } from "@/components/schedules/tour_selector/AdminScheduleTourListSkeleton";
import { AdminPagination } from "@/components/common/admin_shared/tables/AdminPagination";
import { AdminSearchInput } from "@/components/common/admin_shared/tables/AdminSearchInput";
import { ImageWithFallback } from "@/components/common/dialogs_and_feedback/media/ImageWithFallback";
import { TOUR_TYPE_OPTIONS } from "@/lib/tours/admin/filters";
import { formatVND } from "@/lib/utils/currency";
import {
  ChevronRight,
  Clock3,
  Compass,
  EyeOff,
  Globe2,
  MapPin,
  Tag,
  TicketsPlane,
} from "lucide-react";
import type { TourListPanelProps } from "shared";

export function TourListPanel({
  loading,
  tours,
  selectedTourId,
  searchTerm,
  tourTypeFilter,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onSearchChange,
  onFilterChange,
  onSelectTour,
  onPageChange,
}: TourListPanelProps) {
  const icons = {
    all: Compass,
    domestic: MapPin,
    outbound: Globe2,
    international: Globe2,
  };
  return (
    <section
      className="min-w-0 rounded-[14px] border border-[#e1edfc] bg-white shadow-[0_4px_20px_#476dae06] flex flex-col h-[calc(100vh-160px)] min-h-[700px] max-h-[940px] admin-max-900:h-[500px] admin-max-900:min-h-0 overflow-hidden pt-4"
      aria-label="Danh sách tour"
      aria-busy={loading}
    >
      <div className="flex items-center gap-3 min-w-0 px-4 mb-3 shrink-0">
        <span className="grid place-items-center shrink-0 size-10 rounded-xl bg-blue-50 text-[#075bff] border border-blue-100/80">
          <TicketsPlane size={20} />
        </span>
        <div>
          <h2 className="text-[16px] font-[750] text-[#0b1747] leading-tight">Danh sách tour</h2>
          <p className="text-[12px] text-[#637da5] mt-0.5 leading-normal">Chọn tour để xem và quản lý các đợt khởi hành</p>
        </div>
      </div>

      <div className="px-4 shrink-0 mb-2.5">
        <AdminSearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Tìm tên tour hoặc mã tour..."
        />
      </div>

      <div
        className="grid grid-cols-4 gap-1.5 px-4 pb-3 shrink-0 border-b border-[#edf2fb]"
        role="group"
        aria-label="Loại tour"
      >
        {TOUR_TYPE_OPTIONS.map((option) => {
          const Icon = icons[option.id];
          const isSelected = tourTypeFilter === option.id;
          return (
            <button
              type="button"
              key={option.id}
              aria-pressed={isSelected}
              onClick={() => onFilterChange(option.id)}
              className={`inline-flex items-center justify-center gap-1 px-1 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                isSelected
                  ? "bg-[#075bff] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-blue-50 hover:text-[#075bff]"
              }`}
            >
              <Icon size={12} className={isSelected ? "text-white" : "text-slate-500"} />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2 overscroll-auto">
        {loading ? (
          <TourListSkeleton />
        ) : !tours.length ? (
          <p className="p-8 text-center text-[13px] text-[#8091ae]">
            Không tìm thấy tour phù hợp.
          </p>
        ) : (
          tours.map((tour) => {
            const isSelected = selectedTourId === tour.tour_id;
            return (
              <button
                type="button"
                key={tour.tour_id}
                aria-pressed={isSelected}
                onClick={() => onSelectTour(tour.tour_id)}
                className={`relative flex items-center gap-3 w-full rounded-[12px] p-2.5 text-left border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-blue-50/60 border-blue-400 ring-1 ring-blue-400/30 shadow-xs"
                    : "bg-white border-[#edf2fb] hover:bg-slate-50/70 hover:border-blue-200"
                }`}
              >
                <ImageWithFallback
                  src={tour.tour_images?.[0]?.image_url}
                  alt=""
                  className="w-[84px] h-[80px] object-cover shrink-0 rounded-[8px] bg-blue-50 border border-slate-100"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-1.5 py-0.5 rounded-md bg-blue-50 text-[#075bff] border border-blue-100 text-[10px] font-bold leading-normal">
                      {tour.code}
                    </span>
                    {tour.status === 0 && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60 whitespace-nowrap"
                        title="Tour đang tạm ẩn"
                      >
                        <EyeOff size={11} />
                        Tạm ẩn
                      </span>
                    )}
                  </div>
                  <strong className="line-clamp-2 text-[#0b1747] text-[13px] leading-[1.4] font-bold">
                    {tour.name}
                  </strong>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[11.5px] text-[#7387aa]">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={13} className="text-slate-400" />
                      {tour.duration_days}N{tour.duration_nights}Đ
                    </span>
                    <strong className="inline-flex items-center gap-1 text-[#075bff] font-bold">
                      <Tag size={13} />
                      {formatVND(tour.base_price)}
                    </strong>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className={`shrink-0 transition-transform ${isSelected ? "text-[#075bff] translate-x-0.5" : "text-slate-400"}`}
                />
              </button>
            );
          })
        )}
      </div>

      {!loading && (
        <div className="shrink-0 bg-white">
          <AdminPagination
            variant="numbered"
            showSinglePage
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            itemLabel="tour"
            onPageChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
}
