"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock3, Map, Users } from "lucide-react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { getTourTypeLabel } from "@/lib/admin/tours/filters";
import { getTourPageNumbers } from "@/lib/admin/tours/management";
import { formatVND } from "@/lib/utils/currency";
import type { ToursPageTour } from "shared";
import { TourRowActions } from "./TourRowActions";

export function TourManagementTable({
  items,
  loading,
  pendingIds,
  onToggle,
  onDelete,
}: {
  items: ToursPageTour[];
  loading: boolean;
  pendingIds: number[];
  onToggle: (tour: ToursPageTour) => void;
  onDelete: (tour: ToursPageTour) => void;
}) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const checkbox = useRef<HTMLInputElement>(null);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, totalPages);
  const visible = items.slice((current - 1) * pageSize, current * pageSize);
  const allSelected =
    visible.length > 0 &&
    visible.every((tour) => selected.includes(tour.tour_id));
  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
    setSelected((current) =>
      current.filter((id) => items.some((tour) => tour.tour_id === id)),
    );
  }, [items, totalPages]);
  useEffect(() => {
    if (checkbox.current)
      checkbox.current.indeterminate =
        !allSelected && visible.some((tour) => selected.includes(tour.tour_id));
  }, [allSelected, visible, selected]);
  const exportSelected = () => {
    const cell = (value: unknown) =>
      `"${String(value)
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""')}"`;
    const rows = [
      ["Mã tour", "Tên tour", "Giá cơ bản", "Trạng thái", "Lượt đặt"],
      ...items
        .filter((tour) => selected.includes(tour.tour_id))
        .map((tour) => [
          tour.code,
          tour.name,
          tour.base_price,
          tour.status === 1 ? "Hoạt động" : "Tạm ẩn",
          tour.booked_count ?? 0,
        ]),
    ];
    const url = URL.createObjectURL(
      new Blob(
        ["\uFEFF", rows.map((row) => row.map(cell).join(",")).join("\r\n")],
        { type: "text/csv;charset=utf-8;" },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "danh-sach-tour.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const numbers = getTourPageNumbers(current, totalPages);
  return (
    <section
      className="ui-tour-management-tableCard [border:1px_solid_#ffffff] rounded-[16px] [background:#fff] overflow-hidden [box-shadow:0_8px_32px_#5075aa05]"
      aria-label="Danh sách tour"
      aria-busy={loading}
    >
      {selected.length > 0 && (
        <div className="ui-tour-management-selection flex items-center gap-[18px] p-[12px_20px] text-[12px] [background:#edf5ff] text-[#315c94] [&_button]:font-[650] [&_button]:text-[#075bff]">
          <span>Đã chọn {selected.length} tour</span>
          <button type="button" onClick={exportSelected}>
            Xuất CSV
          </button>
          <button type="button" onClick={() => setSelected([])}>
            Bỏ chọn
          </button>
        </div>
      )}
      <div className="ui-tour-management-tableScroll overflow-x-auto">
        <table className="ui-tour-management-table w-full border-collapse text-left whitespace-nowrap text-[13px] [&_thead]:[background:linear-gradient(#fafcff,_#f4f7fb)] [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[.35px]! [&_th]:text-[#5873a2] [&_th]:p-[15px_16px] [&_th]:[border-bottom:1px_solid_#e6eef9] [&_td]:p-[12px_16px] [&_td]:[border-bottom:1px_solid_#eaf0f9] [&_td]:[vertical-align:middle] [&_th:first-child]:pr-[8px] [&_th:first-child]:w-[44px] [&_th:first-child]:pl-[24px] [&_td:first-child]:pr-[8px] [&_td:first-child]:w-[44px] [&_td:first-child]:pl-[24px] [&_th:last-child]:text-center [&_th:last-child]:w-[76px] [&_td:last-child]:text-center [&_td:last-child]:w-[76px] [&_input]:w-[16px] [&_input]:h-[16px] [&_input]:[accent-color:#075bff] [&_input]:[vertical-align:middle] [&_input]:cursor-pointer [&_tbody_tr:hover]:[background:#f7faff] [&_tr[data-selected=true]]:[background:#f7faff] min-[1600px]:[&_td]:pt-[10px] min-[1600px]:[&_td]:pb-[10px]">
          <thead>
            <tr>
              <th>
                <input
                  ref={checkbox}
                  type="checkbox"
                  aria-label="Chọn tất cả tour trong trang"
                  checked={allSelected}
                  disabled={loading || !visible.length}
                  onChange={() =>
                    setSelected(
                      allSelected
                        ? selected.filter(
                            (id) =>
                              !visible.some((tour) => tour.tour_id === id),
                          )
                        : [
                            ...new Set([
                              ...selected,
                              ...visible.map((tour) => tour.tour_id),
                            ]),
                          ],
                    )
                  }
                />
              </th>
              {[
                "Thông tin tour",
                "Loại tour",
                "Thời gian",
                "Giá cơ bản",
                "Trạng thái",
                "Đã đặt",
                "Thao tác",
              ].map((label) => (
                <th key={label} scope="col">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }, (_, index) => (
                  <tr key={index} aria-hidden="true">
                    {Array.from({ length: 8 }, (_, column) => (
                      <td key={column}>
                        <div className="ui-tour-management-skeleton min-h-[40px] rounded-[8px] [background:linear-gradient(90deg,_#eff4fa,_#f8faff,_#eff4fa)] [background-size:200%_100%] animate-admin-shimmer motion-reduce:animate-none" />
                      </td>
                    ))}
                  </tr>
                ))
              : visible.map((tour) => (
                  <tr
                    key={tour.tour_id}
                    data-selected={selected.includes(tour.tour_id)}
                  >
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Chọn tour ${tour.name}`}
                        checked={selected.includes(tour.tour_id)}
                        onChange={(event) =>
                          setSelected(
                            event.target.checked
                              ? [...selected, tour.tour_id]
                              : selected.filter((id) => id !== tour.tour_id),
                          )
                        }
                      />
                    </td>
                    <td>
                      <Link
                        href={`/admin/tours/${tour.tour_id}`}
                        className="ui-tour-management-tourInfo flex items-center gap-[12px] min-w-[260px] max-w-[380px] [&>div]:min-w-0 [&_strong]:block [&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_strong]:text-[#101e49] [&_strong]:font-bold [&_strong]:text-[13px] [&_strong]:mb-[3px] [&:hover_strong]:text-[#075bff] [&_span]:block [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:text-[12px] [&_span]:text-[#7489b0] [&_span]:max-w-[290px] [&_span]:leading-[1.5] min-[1600px]:max-w-[430px] min-[1600px]:[&_strong]:text-[14px]"
                      >
                        <ImageWithFallback
                          src={tour.tour_images?.[0]?.image_url}
                          alt={tour.name}
                          className="ui-tour-management-thumbnail w-[66px] h-[52px] object-cover rounded-[9px] shrink-0 [background:#e8f1fc]"
                        />
                        <div>
                          <strong title={tour.name}>{tour.name}</strong>
                          <span>Mã: {tour.code}</span>
                          {tour.summary && (
                            <span title={tour.summary}>{tour.summary}</span>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td>
                      <span className="ui-tour-management-typeBadge inline-block [background:#e8f2ff] text-[#075bff] p-[5px_9px] rounded-[7px] text-[11px]">
                        {getTourTypeLabel(tour.tour_type)}
                      </span>
                    </td>
                    <td>
                      <span className="ui-tour-management-inline inline-flex items-center gap-[9px] text-[#647eaf]">
                        <Clock3 size={16} />
                        {tour.duration_days}N {tour.duration_nights}Đ
                      </span>
                    </td>
                    <td className="ui-tour-management-price text-[#075bff] font-[750]">
                      {formatVND(tour.base_price)}
                    </td>
                    <td>
                      <span
                        className="ui-tour-management-status inline-block min-w-[76px] text-center rounded-[7px] p-[6px_10px] text-[#e28c12] [background:#fff2df] text-[12px] [&[data-active=true]]:text-[#008563] [&[data-active=true]]:[background:#e2f8ef]"
                        data-active={tour.status === 1}
                      >
                        {tour.status === 1 ? "Hoạt động" : "Tạm ẩn"}
                      </span>
                    </td>
                    <td>
                      <span
                        className="ui-tour-management-inline inline-flex items-center gap-[9px] text-[#647eaf]"
                        title="Số đơn đặt tour chưa bị hủy"
                      >
                        <Users size={17} />
                        {(tour.booked_count ?? 0).toLocaleString("vi-VN")}
                      </span>
                    </td>
                    <td>
                      <TourRowActions
                        tour={tour}
                        busy={pendingIds.includes(tour.tour_id)}
                        onToggle={onToggle}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {!loading && !items.length && (
        <div className="ui-tour-management-empty flex flex-col items-center gap-[10px] p-[54px_20px] text-[#7087ab] [&_strong]:text-[#29466c] [&_p]:text-[13px]">
          <Map size={36} />
          <strong>Không tìm thấy tour nào</strong>
          <p>Thử thay đổi từ khóa hoặc bộ lọc để xem các tour khác.</p>
        </div>
      )}
      <footer className="ui-tour-management-pagination flex items-center justify-between gap-[16px] p-[14px_20px] [&_p]:text-[12px] [&_p]:text-[#6d85b2] [&_nav]:flex [&_nav]:items-center [&_nav]:gap-[5px] [&_button]:grid [&_button]:place-items-center [&_button]:min-w-[30px] [&_button]:h-[30px] [&_button]:p-[0_6px] [&_button]:[border:1px_solid_#e3ebf8] [&_button]:rounded-[7px] [&_button]:text-[12px] [&_button]:text-[#5675a8] [&_button:hover:enabled]:[background:#eff5ff] [&_button:hover:enabled]:text-[#075bff] [&_button:hover:enabled]:[border-color:#b6d0ff] [&_button[aria-current=page]]:[background:#075bff] [&_button[aria-current=page]]:text-[white] [&_button[aria-current=page]]:[border-color:#075bff] [&_button[aria-current=page]]:[box-shadow:0_3px_6px_#075bff26] [&_button[aria-current=page]:hover:enabled]:[background:#0646ce] [&_button[aria-current=page]:hover:enabled]:text-[#fff] [&_button[aria-current=page]:hover:enabled]:[border-color:#0646ce] [&_button:disabled]:opacity-[.35] admin-max-750:items-start admin-max-750:flex-col admin-max-750:p-[14px] admin-max-750:[&_nav]:max-w-full admin-max-750:[&_nav]:flex-wrap">
        <p role="status">
          {loading
            ? "Đang tải danh sách tour..."
            : `Hiển thị ${items.length ? (current - 1) * pageSize + 1 : 0}–${Math.min(current * pageSize, items.length)} trên tổng ${items.length} tour`}
        </p>
        <nav aria-label="Phân trang tour">
          <button
            type="button"
            aria-label="Trang trước"
            disabled={loading || current === 1}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          {numbers.map((number, index) => (
            <span key={number} className="ui-tour-management-pageGroup flex items-center gap-[5px]">
              {index > 0 && number - numbers[index - 1] > 1 && (
                <span className="ui-tour-management-ellipsis p-[0_5px] text-[#93a6c4]">…</span>
              )}
              <button
                type="button"
                aria-label={`Trang ${number}`}
                aria-current={current === number ? "page" : undefined}
                disabled={loading}
                onClick={() => setPage(number)}
              >
                {number}
              </button>
            </span>
          ))}
          <button
            type="button"
            aria-label="Trang sau"
            disabled={loading || current === totalPages}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      </footer>
    </section>
  );
}
