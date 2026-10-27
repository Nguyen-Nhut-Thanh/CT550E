"use client";

import { TourListSkeleton } from "./TourListSkeleton";
import { AdminPagination } from "@/components/common/AdminPagination";
import { AdminSearchInput } from "@/components/common/AdminSearchInput";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { TOUR_TYPE_OPTIONS } from "@/lib/admin/tours/filters";
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
      className="ui-schedule-overview-tourPanel min-w-0 [border:1px_solid_#fff] rounded-[20px] [background:#ffffffed] [box-shadow:0_8px_28px_#476dae05] flex flex-col sticky top-[20px] max-h-[calc(100dvh_-_120px)] overflow-hidden pt-[18px] [&>.ui-schedule-overview-panelHead]:p-[0_18px_16px] min-[901px]:static min-[901px]:h-full min-[901px]:min-h-0 min-[901px]:max-h-[none] min-[901px]:[&>:not(.ui-schedule-overview-tourList)]:shrink-0 admin-max-900:static admin-max-900:max-h-[490px] admin-max-600:pt-[14px] admin-max-600:rounded-[16px] admin-max-600:[&>.ui-schedule-overview-panelHead]:p-[0_14px_12px]"
      aria-label="Danh sách tour"
      aria-busy={loading}
    >
      <div className="ui-schedule-overview-panelHead flex items-center gap-[12px] min-w-0 [&_h2]:text-[18px] [&_h2]:font-[750] [&_h2]:text-[#0e2046] [&_h2]:m-[0_0_3px] [&_p]:text-[12px] [&_p]:text-[#7489af] admin-max-1100:[&_p]:text-[11px] admin-max-600:[&_h2]:text-[16px]">
        <span className="ui-schedule-overview-sectionIcon grid place-items-center shrink-0 w-[42px] h-[42px] [background:#e8f2ff] text-[#0770ff] rounded-[12px] admin-max-600:w-[36px] admin-max-600:h-[38px]">
          <TicketsPlane size={22} />
        </span>
        <div>
          <h2>Danh sách tour</h2>
          <p>Chọn tour để xem và quản lý các đợt khởi hành</p>
        </div>
      </div>
      <div className="ui-schedule-overview-search p-[0_18px] [&_input]:text-[12px] [&_input]:[border-color:#dee8f8] [&_input]:pt-[10px] [&_input]:pb-[10px] admin-max-600:p-[0_14px]">
        <AdminSearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Tìm tên tour hoặc mã tour..."
        />
      </div>
      <div
        className="ui-schedule-overview-tourTabs flex gap-[8px] flex-wrap p-[12px_18px] [&_button]:inline-flex [&_button]:items-center [&_button]:justify-center [&_button]:gap-[6px] [&_button]:p-[8px_11px] [&_button]:whitespace-nowrap [&_button]:[border:1px_solid_#e5ecf8] [&_button]:rounded-[10px] [&_button]:[background:white] [&_button]:text-[#3f5c88] [&_button]:text-[11px] [&_button]:[transition:background_.15s,_color_.15s] [&_button_svg]:text-[#078aa9] [&_button:hover]:text-[#075bff] [&_button:hover]:[background:#f1f6ff] [&_button[aria-pressed=true]]:[background:#075bff] [&_button[aria-pressed=true]]:[border-color:#075bff] [&_button[aria-pressed=true]]:text-[white] [&_button[aria-pressed=true]]:[box-shadow:0_4px_10px_#075bff16] [&_button[aria-pressed=true]:hover]:[background:#0646ce] [&_button[aria-pressed=true]:hover]:text-[white] [&_button[aria-pressed=true]_svg]:text-[white] admin-max-1400:gap-[5px] admin-max-1400:[&_button]:text-[10px] admin-max-1400:[&_button]:p-[7px_8px] admin-max-900:[&_button]:text-[12px] admin-max-600:p-[12px_14px] admin-max-600:gap-[6px] admin-max-600:[&_button]:text-[10px] admin-max-600:[&_button]:p-[7px_7px] admin-max-600:[&_button_svg]:hidden"
        role="group"
        aria-label="Loại tour"
      >
        {TOUR_TYPE_OPTIONS.map((option) => {
          const Icon = icons[option.id];
          return (
            <button
              type="button"
              key={option.id}
              aria-pressed={tourTypeFilter === option.id}
              onClick={() => onFilterChange(option.id)}
            >
              <Icon size={14} />
              {option.label}
            </button>
          );
        })}
      </div>
      <div className="ui-schedule-overview-tourList overflow-y-auto overflow-x-hidden min-h-0 p-[2px_14px_8px] [scrollbar-width:thin] [scrollbar-color:#cdddf3_transparent] min-[901px]:[flex:1] min-[901px]:overscroll-contain admin-max-900:max-h-[300px] admin-max-600:pl-[10px] admin-max-600:pr-[10px]">
        {loading ? (
          <TourListSkeleton />
        ) : !tours.length ? (
          <p className="ui-schedule-overview-noTours p-[36px_15px] text-center text-[13px] text-[#8091ae]">
            Không tìm thấy tour phù hợp.
          </p>
        ) : (
          tours.map((tour) => (
            <button
              type="button"
              key={tour.tour_id}
              aria-pressed={selectedTourId === tour.tour_id}
              onClick={() => onSelectTour(tour.tour_id)}
              className="ui-schedule-overview-tourCard relative flex items-center gap-[12px] w-full [border:1px_solid_#edf2fa] rounded-[12px] p-[10px] text-left [background:#fff] mb-[7px] [transition:background_.15s,_border-color_.15s] [&:hover]:[background:#f5f9ff] [&:hover]:[border-color:#b8d2ff] [&[aria-pressed=true]]:[background:linear-gradient(110deg,_#eef6ff,_#f8fbff)] [&[aria-pressed=true]]:[border-color:#438bff] [&[aria-pressed=true]]:[box-shadow:inset_3px_0_#075bff] min-[1600px]:gap-[14px] admin-max-1100:gap-[8px] admin-max-1100:p-[8px]"
            >
              <ImageWithFallback
                src={tour.tour_images?.[0]?.image_url}
                alt=""
                className="ui-schedule-overview-tourImage w-[90px] h-[88px] object-cover shrink-0 rounded-[8px] [background:#e8f1fb] min-[1600px]:w-[94px] min-[1600px]:h-[90px] admin-max-1400:w-[72px] admin-max-1400:h-[80px] admin-max-1100:w-[60px] admin-max-1100:h-[74px] admin-max-900:w-[78px] admin-max-900:h-[74px]"
              />
              <div className="ui-schedule-overview-tourDescription min-w-0 [flex:1] [&>strong]:[display:-webkit-box] [&>strong]:[-webkit-line-clamp:2] [&>strong]:[-webkit-box-orient:vertical] [&>strong]:overflow-hidden [&>strong]:text-[#102347] [&>strong]:text-[13px] [&>strong]:leading-[1.45] [&>strong]:font-bold min-[1600px]:[&>strong]:text-[14px] admin-max-1100:[&>strong]:text-[12px] admin-max-900:[&>strong]:text-[13px]">
                <div className="ui-schedule-overview-codeRow flex items-center gap-[6px] mb-[5px]">
                  <span className="ui-schedule-overview-code inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap p-[2px_5px] rounded-[4px] [background:#e2efff] text-[#0764ff] text-[10px] leading-[1.5]">
                    {tour.code}
                  </span>
                  {tour.status === 0 && (
                    <span
                      className="ui-schedule-overview-hiddenTour inline-flex items-center gap-[3px] text-[9px] text-[#a9762b] whitespace-nowrap"
                      title="Tour đang tạm ẩn"
                    >
                      <EyeOff size={12} />
                      Tạm ẩn
                    </span>
                  )}
                </div>
                <strong>{tour.name}</strong>
                <div className="ui-schedule-overview-tourMeta flex items-center flex-wrap [column-gap:14px] [row-gap:5px] mt-[7px] text-[12px] text-[#7890b8] [&>span]:inline-flex [&>span]:items-center [&>span]:gap-[6px] [&>b]:inline-flex [&>b]:items-center [&>b]:gap-[6px] [&>b]:text-[#075bff] [&>b]:font-[650] [&>b]:whitespace-nowrap [&_svg]:shrink-0 min-[1600px]:text-[12px] admin-max-1400:text-[11px] admin-max-1400:[column-gap:10px] admin-max-900:text-[12px]">
                  <span>
                    <Clock3 size={14} />
                    {tour.duration_days} ngày {tour.duration_nights} đêm
                  </span>
                  <b>
                    <Tag size={14} />
                    {formatVND(tour.base_price)}
                  </b>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="ui-schedule-overview-tourArrow text-[#075bff] shrink-0 w-[14px]"
              />
            </button>
          ))
        )}
      </div>
      {!loading && (
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
      )}
    </section>
  );
}
