"use client";

import Link from "next/link";
import { AdminPagination } from "@/components/admin/common/AdminPagination";
import { ImageWithFallback } from "@/components/common/media/ImageWithFallback";
import {
  getScheduleBookedCount,
  getScheduleStatusMeta,
} from "@/lib/admin/schedules/status";
import { formatVND } from "@/lib/utils/currency";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Plus,
  Tag,
  Users,
} from "lucide-react";
import type { ScheduleTablePanelProps } from "shared";
import { ScheduleRowActions } from "./ScheduleRowActions";
import { ScheduleTableSkeleton } from "./ScheduleTableSkeleton";

export function ScheduleTablePanel({
  selectedTourId,
  selectedTour,
  schedules,
  loading,
  scheduleStatusFilter,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onFilterChange,
  onCreate,
  onEdit,
  onDelete,
  onToggleStatus,
  onPageChange,
  pendingIds = [],
}: ScheduleTablePanelProps) {
  const tabs = [
    { id: "upcoming", label: "Sắp khởi hành" },
    { id: "past", label: "Đã đi" },
    { id: "selling", label: "Đang bán" },
    { id: "full", label: "Hết chỗ" },
    { id: "hidden", label: "Tạm khóa" },
    { id: "all", label: "Tất cả" },
  ];
  return (
    <section
      className="ui-schedule-overview-schedulePanel min-w-0 [border:1px_solid_#fff] rounded-[20px] [background:#ffffffed] [box-shadow:0_8px_28px_#476dae05] p-[16px] min-h-[420px] min-[901px]:flex min-[901px]:flex-col min-[901px]:[flex:1] min-[901px]:min-h-0 min-[901px]:overflow-hidden admin-max-1100:p-[12px] admin-max-600:p-[12px] admin-max-600:rounded-[16px]"
      aria-label="Các đợt khởi hành"
      aria-busy={loading}
    >
      {selectedTour && (
        <div className="ui-schedule-overview-selectedTour flex items-center gap-[14px] rounded-[14px] [background:linear-gradient(110deg,_#eaf4ff,_#f3f8ff)] p-[12px] mb-[18px] min-[901px]:shrink-0 admin-max-1400:flex-wrap admin-max-900:[flex-wrap:nowrap] admin-max-600:gap-[10px] admin-max-600:flex-wrap admin-max-600:p-[10px] admin-max-600:mb-[18px]">
          <ImageWithFallback
            src={selectedTour.tour_images?.[0]?.image_url}
            alt=""
            className="ui-schedule-overview-selectedImage w-[104px] h-[78px] rounded-[9px] object-cover shrink-0 [background:#dfecfa] admin-max-1400:w-[85px] admin-max-1400:h-[68px] admin-max-600:w-[68px] admin-max-600:h-[68px]"
          />
          <div className="ui-schedule-overview-selectedDescription [flex:1] min-w-0 [&_h2]:text-[#102348] [&_h2]:text-[17px] [&_h2]:font-[750] [&_h2]:leading-[1.4] [&_h2]:mt-[4px] [&_h2]:[overflow-wrap:anywhere] [&_.ui-schedule-overview-code]:[background:#dbeafe] [&_.ui-schedule-overview-code]:text-[#174ea6] [&_.ui-schedule-overview-code]:[border:1px_solid_#bfdbfe] [&_.ui-schedule-overview-code]:font-bold [&_.ui-schedule-overview-code]:p-[3px_7px] [&_.ui-schedule-overview-code]:rounded-[5px] admin-max-1100:[&_h2]:text-[14px] admin-max-600:min-w-[150px] admin-max-600:[&_h2]:text-[13px]">
            <span className="ui-schedule-overview-code inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap p-[2px_5px] rounded-[4px] [background:#e2efff] text-[#0764ff] text-[10px] leading-[1.5]">
              {selectedTour.code}
            </span>
            <h2>{selectedTour.name}</h2>
            <div className="ui-schedule-overview-tourMeta flex items-center flex-wrap [column-gap:14px] [row-gap:5px] mt-[7px] text-[12px] text-[#7890b8] [&>span]:inline-flex [&>span]:items-center [&>span]:gap-[6px] [&>b]:inline-flex [&>b]:items-center [&>b]:gap-[6px] [&>b]:text-[#075bff] [&>b]:font-[650] [&>b]:whitespace-nowrap [&_svg]:shrink-0 min-[1600px]:text-[12px] admin-max-1400:text-[11px] admin-max-1400:[column-gap:10px] admin-max-900:text-[12px]">
              <span>
                <Clock3 size={14} />
                {selectedTour.duration_days} ngày {selectedTour.duration_nights}{" "}
                đêm
              </span>
              <b>
                <Tag size={14} />
                {formatVND(selectedTour.base_price)}
              </b>
            </div>
          </div>
          <Link
            href={`/admin/tours/${selectedTourId}`}
            className="ui-schedule-overview-detailLink inline-flex items-center justify-center gap-[10px] [background:white] [border:1px_solid_#bed6ff] text-[#075bff] rounded-[24px] whitespace-nowrap p-[8px_12px] text-[11px] [box-shadow:0_3px_8px_#2158b209] [&:hover]:[background:#edf5ff] admin-max-1400:ml-[auto] admin-max-900:ml-[0] admin-max-600:ml-[auto]"
          >
            Xem chi tiết tour <ArrowRight size={15} />
          </Link>
        </div>
      )}
      <div className="ui-schedule-overview-scheduleHead flex items-center justify-between gap-[14px] m-[0_2px_14px] min-[901px]:shrink-0 admin-max-1400:flex-wrap admin-max-900:[flex-wrap:nowrap] admin-max-600:flex-wrap admin-max-600:gap-[12px]">
        <div className="ui-schedule-overview-panelHead flex items-center gap-[12px] min-w-0 [&_h2]:text-[18px] [&_h2]:font-[750] [&_h2]:text-[#0e2046] [&_h2]:m-[0_0_3px] [&_p]:text-[12px] [&_p]:text-[#7489af] admin-max-1100:[&_p]:text-[11px] admin-max-600:[&_h2]:text-[16px]">
          <span className="ui-schedule-overview-sectionIcon grid place-items-center shrink-0 w-[42px] h-[42px] [background:#e8f2ff] text-[#0770ff] rounded-[12px] admin-max-600:w-[36px] admin-max-600:h-[38px]">
            <CalendarDays size={22} />
          </span>
          <div>
            <h2>Các đợt khởi hành</h2>
            <p>Danh sách các đợt khởi hành của tour này</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="ui-schedule-overview-primary inline-flex items-center justify-center gap-[8px] rounded-[12px] p-[12px_16px] [background:#075bff] text-[#fff] text-[13px] font-semibold whitespace-nowrap [box-shadow:0_5px_12px_#075bff22] [&:hover]:[background:#0646ce] admin-max-600:text-[12px] admin-max-600:p-[10px_13px]"
        >
          <Plus size={20} />
          Thêm đợt mới
        </button>
      </div>
      <div
        className="ui-schedule-overview-scheduleTabs flex gap-[8px] flex-wrap m-[0_2px_18px] [&_button]:inline-flex [&_button]:items-center [&_button]:justify-center [&_button]:gap-[6px] [&_button]:p-[8px_15px] [&_button]:whitespace-nowrap [&_button]:[border:1px_solid_#e5ecf8] [&_button]:rounded-[10px] [&_button]:[background:white] [&_button]:text-[#3f5c88] [&_button]:text-[12px] [&_button]:[transition:background_.15s,_color_.15s] [&_button:hover]:text-[#075bff] [&_button:hover]:[background:#f1f6ff] [&_button[aria-pressed=true]]:[background:#075bff] [&_button[aria-pressed=true]]:[border-color:#075bff] [&_button[aria-pressed=true]]:text-[white] [&_button[aria-pressed=true]]:[box-shadow:0_4px_10px_#075bff16] [&_button[aria-pressed=true]:hover]:[background:#0646ce] [&_button[aria-pressed=true]:hover]:text-[white] min-[901px]:shrink-0 admin-max-1400:[&_button]:p-[7px_10px] admin-max-600:gap-[6px] admin-max-600:mb-[14px] admin-max-600:[&_button]:text-[10px] admin-max-600:[&_button]:p-[7px_10px]"
        role="group"
        aria-label="Lọc lịch khởi hành"
      >
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            aria-pressed={scheduleStatusFilter === tab.id}
            onClick={() => onFilterChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="ui-schedule-overview-scheduleTable [border:1px_solid_#e6eef9] rounded-[14px] overflow-hidden min-[901px]:flex min-[901px]:flex-col min-[901px]:[flex:1] min-[901px]:min-h-0 min-[901px]:[&>:first-child]:[flex:1] min-[901px]:[&>:first-child]:min-h-0 min-[901px]:[&>:first-child]:overflow-auto min-[901px]:[&>:first-child]:overscroll-contain min-[901px]:[&>:last-child]:shrink-0">
        {loading ? (
          <ScheduleTableSkeleton />
        ) : !schedules.length ? (
          <div className="ui-schedule-overview-empty flex items-center justify-center flex-col gap-[12px] p-[64px_20px] text-center text-[#8ca1be] [&_strong]:text-[14px] [&_strong]:text-[#5c769d] [&_p]:text-[12px]">
            <CalendarDays size={34} />
            <strong>Chưa có lịch khởi hành trong mục này</strong>
            <p>Chọn bộ lọc khác hoặc thêm một đợt khởi hành mới.</p>
          </div>
        ) : (
          <div className="ui-schedule-overview-tableScroll overflow-x-auto [&_table]:border-collapse [&_table]:text-left [&_table]:w-full [&_table]:text-[12px] [&_table]:whitespace-nowrap [&_th]:p-[13px_16px] [&_th]:[background:#f1f5fa] [&_th]:text-[#7c91b5] [&_th]:font-medium [&_th]:text-[11px] [&_td]:[border-top:1px_solid_#edf2fa] [&_td]:p-[18px_16px] [&_td]:[vertical-align:middle] [&_tbody_tr:hover]:[background:#f8fbff] [&_th:last-child]:text-center [&_th:last-child]:pl-[10px] [&_th:last-child]:pr-[10px] [&_td:last-child]:text-center [&_td:last-child]:pl-[10px] [&_td:last-child]:pr-[10px] min-[901px]:[&_thead]:sticky min-[901px]:[&_thead]:top-[0] min-[901px]:[&_thead]:z-[1] min-[1600px]:[&_td]:p-[16px_16px] admin-max-1400:[&_td]:pl-[12px] admin-max-1400:[&_td]:pr-[12px] admin-max-1400:[&_th]:pl-[12px] admin-max-1400:[&_th]:pr-[12px] admin-max-600:[&_td]:pt-[15px] admin-max-600:[&_td]:pb-[15px]">
            <table>
              <thead>
                <tr>
                  {[
                    "Thời gian khởi hành",
                    "Giá đợt",
                    "Số chỗ",
                    "Trạng thái",
                    "Thao tác",
                  ].map((label) => (
                    <th scope="col" key={label}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => {
                  const start = new Date(schedule.start_date);
                  const end = new Date(schedule.end_date);
                  const booked = getScheduleBookedCount(schedule);
                  const percent =
                    schedule.quota > 0
                      ? Math.min(
                          100,
                          Math.round((booked / schedule.quota) * 100),
                        )
                      : 0;
                  const status = getScheduleStatusMeta(schedule, {
                    isParentHidden: selectedTour?.status === 0,
                  });
                  return (
                    <tr key={schedule.tour_schedule_id}>
                      <td>
                        <div className="ui-schedule-overview-dateCell flex items-center gap-[12px]">
                          <div className="ui-schedule-overview-dateTile flex flex-col items-center justify-center w-[50px] h-[60px] rounded-[10px] [border:1px_solid_#dceaff] [background:linear-gradient(#f4f9ff,_#eaf3ff)] text-[#075bff] shrink-0 [&_span]:text-[10px] [&_strong]:text-[23px] [&_strong]:font-extrabold [&_strong]:leading-[1.2] [&_strong]:mt-[3px]">
                            <span>THG {start.getMonth() + 1}</span>
                            <strong>
                              {String(start.getDate()).padStart(2, "0")}
                            </strong>
                          </div>
                          <div>
                            <strong className="ui-schedule-overview-departureDate text-[13px] font-bold text-[#182d53]">
                              {start.toLocaleDateString("vi-VN", {
                                weekday: "short",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </strong>
                            <span className="ui-schedule-overview-subtext flex items-center gap-[5px] mt-[4px] text-[11px] text-[#7d93b9]">
                              Đến: {end.toLocaleDateString("vi-VN")}
                            </span>
                            <span className="ui-schedule-overview-subtext flex items-center gap-[5px] mt-[4px] text-[11px] text-[#7d93b9]">
                              <Clock3 size={12} />
                              {start.toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {selectedTour
                                ? ` · ${selectedTour.duration_days} ngày ${selectedTour.duration_nights} đêm`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong className="ui-schedule-overview-schedulePrice text-[13px] font-[750] text-[#152a4d]">
                          {formatVND(schedule.price)}
                        </strong>
                        <span className="ui-schedule-overview-subtext flex items-center gap-[5px] mt-[4px] text-[11px] text-[#7d93b9]">
                          / khách
                        </span>
                      </td>
                      <td>
                        <div className="ui-schedule-overview-capacity min-w-[114px] [&>span]:flex [&>span]:items-center [&>span]:gap-[8px] [&>span]:text-[#496d9f] [&>span_svg]:text-[#075bff]">
                          <span>
                            <Users size={16} />
                            {booked} / {schedule.quota}
                          </span>
                          <div className="ui-schedule-overview-progressRow flex items-center gap-[8px] mt-[7px] [&_small]:text-[10px] [&_small]:text-[#8296b9] [&_small]:min-w-[27px]">
                            <div
                              className="ui-schedule-overview-progress h-[7px] rounded-[10px] [background:#e5ebf5] overflow-hidden w-[85px] [&_i]:block [&_i]:h-full [&_i]:rounded-[10px] [&_i]:[background:#075bff] [&_i[data-level=high]]:[background:#ffad16] [&_i[data-level=full]]:[background:#ff3a5c]"
                              role="progressbar"
                              aria-label="Tỷ lệ chỗ đã đặt"
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={percent}
                              aria-valuetext={`${booked} trên ${schedule.quota} chỗ`}
                            >
                              <i
                                style={{ width: `${percent}%` }}
                                data-level={
                                  percent >= 100
                                    ? "full"
                                    : percent >= 75
                                      ? "high"
                                      : "normal"
                                }
                              />
                            </div>
                            <small>{percent}%</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="ui-schedule-overview-status inline-block [white-space:normal] max-w-[130px] min-w-[72px] text-center [background:#edf2f8] text-[#7285a1] rounded-[22px] p-[7px_10px] text-[10px] font-[650] [&[data-tone=success]]:[background:#dff9ed] [&[data-tone=success]]:text-[#009562] [&[data-tone=warning]]:[background:#fff2dc] [&[data-tone=warning]]:text-[#be7a12] [&[data-full=true]]:[background:#ffe0e6] [&[data-full=true]]:text-[#e83251]"
                          data-tone={status.tone}
                          data-full={status.label === "Đã hết chỗ"}
                        >
                          {status.label === "Đang hoạt động"
                            ? "Đang bán"
                            : status.label === "Đã hết chỗ"
                              ? "Hết chỗ"
                              : status.label}
                        </span>
                      </td>
                      <td>
                        <ScheduleRowActions
                          schedule={schedule}
                          busy={pendingIds.includes(schedule.tour_schedule_id)}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onToggleStatus={onToggleStatus}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && (
          <AdminPagination
            variant="numbered"
            showSinglePage
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            itemLabel="đợt"
            onPageChange={onPageChange}
          />
        )}
      </div>
    </section>
  );
}
