"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock3, Map, Users } from "lucide-react";
import { AdminPagination } from "@/components/common/admin_shared/tables/AdminPagination";
import { ImageWithFallback } from "@/components/common/dialogs_and_feedback/media/ImageWithFallback";
import { getTourTypeLabel } from "@/lib/tours/admin/filters";
import { formatVND } from "@/lib/utils/currency";
import type { ToursPageTour } from "shared";
import { TourRowActions } from "@/components/tours/tour_management/AdminTourRowActions";

export function TourManagementTable({
  items,
  loading,
  page,
  onPageChange,
  pendingIds,
  onToggle,
  onDelete,
}: {
  items: ToursPageTour[];
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  pendingIds: number[];
  onToggle: (tour: ToursPageTour) => void;
  onDelete: (tour: ToursPageTour) => void;
}) {
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
    // Do not reset a restored page while the initial list is still empty/loading.
    if (loading) return;
    if (page > totalPages) onPageChange(totalPages);
    setSelected((current) =>
      current.filter((id) => items.some((tour) => tour.tour_id === id)),
    );
  }, [items, totalPages, loading, page, onPageChange]);
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
  return (
    <section
      className="ui-tour-management-tableCard rounded-[14px] border border-[#e1edfc] bg-white overflow-hidden shadow-2xs"
      aria-label="Danh sách tour"
      aria-busy={loading}
    >
      {selected.length > 0 && (
        <div className="ui-tour-management-selection flex items-center gap-4 px-4 py-2.5 text-xs bg-blue-50/80 border-b border-blue-100 text-[#075bff] font-semibold">
          <span>Đã chọn {selected.length} tour</span>
          <button type="button" onClick={exportSelected} className="hover:underline cursor-pointer">
            Xuất CSV
          </button>
          <button type="button" onClick={() => setSelected([])} className="hover:underline text-slate-500 cursor-pointer">
            Bỏ chọn
          </button>
        </div>
      )}
      <div className="ui-tour-management-tableScroll overflow-x-auto">
        <table className="ui-tour-management-table w-full border-collapse text-left whitespace-nowrap text-[13px]">
          <thead className="bg-slate-50/75 border-b border-[#edf2fb] text-[12px] font-[650] text-[#7387aa]">
            <tr>
              <th className="px-3.5 py-3 w-10 text-center">
                <input
                  ref={checkbox}
                  type="checkbox"
                  aria-label="Chọn tất cả tour trong trang"
                  checked={allSelected}
                  disabled={loading || !visible.length}
                  className="rounded border-slate-300 text-[#075bff] focus:ring-[#075bff] cursor-pointer"
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
                <th key={label} scope="col" className={`px-3.5 py-3 ${label === "Thao tác" ? "text-center w-20" : ""}`}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf2fb]">
            {loading
              ? Array.from({ length: 6 }, (_, index) => (
                  <tr key={index} aria-hidden="true">
                    {Array.from({ length: 8 }, (_, column) => (
                      <td key={column} className="px-3.5 py-2.5">
                        <div className="min-h-[38px] rounded-lg bg-slate-100/80 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : visible.map((tour) => (
                  <tr
                    key={tour.tour_id}
                    data-selected={selected.includes(tour.tour_id)}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-3.5 py-2.5 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Chọn tour ${tour.name}`}
                        checked={selected.includes(tour.tour_id)}
                        className="rounded border-slate-300 text-[#075bff] focus:ring-[#075bff] cursor-pointer"
                        onChange={(event) =>
                          setSelected(
                            event.target.checked
                              ? [...selected, tour.tour_id]
                              : selected.filter((id) => id !== tour.tour_id),
                          )
                        }
                      />
                    </td>
                    <td className="px-3.5 py-2.5">
                      <Link
                        href={`/admin/tours/${tour.tour_id}`}
                        className="ui-tour-management-tourInfo flex items-center gap-3 min-w-[260px] max-w-[380px] group"
                      >
                        <ImageWithFallback
                          src={tour.tour_images?.[0]?.image_url}
                          alt={tour.name}
                          className="w-14 h-11 object-cover rounded-lg border border-slate-100 shrink-0 bg-slate-100"
                        />
                        <div className="min-w-0">
                          <strong title={tour.name} className="block overflow-hidden text-ellipsis font-bold text-[13px] text-[#0b1747] group-hover:text-[#075bff] transition-colors mb-0.5">
                            {tour.name}
                          </strong>
                          <span className="block text-xs font-mono text-[#7387aa]">
                            Mã: {tour.code}
                          </span>
                          {tour.summary && (
                            <span title={tour.summary} className="block overflow-hidden text-ellipsis text-xs text-[#7387aa] max-w-[280px]">
                              {tour.summary}
                            </span>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="inline-block rounded-lg border border-blue-100 bg-blue-50 text-[#075bff] px-2 py-0.5 text-[11px] font-[650]">
                        {getTourTypeLabel(tour.tour_type)}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                        <Clock3 size={14} className="text-slate-400" />
                        <span>{tour.duration_days}N {tour.duration_nights}Đ</span>
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-[750] text-[#075bff]">
                      {formatVND(tour.base_price)}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-[650] whitespace-nowrap ${
                          tour.status === 1
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            tour.status === 1 ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        {tour.status === 1 ? "Hoạt động" : "Tạm ẩn"}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs text-slate-600"
                        title="Số đơn đặt tour chưa bị hủy"
                      >
                        <Users size={14} className="text-slate-400" />
                        <span>{(tour.booked_count ?? 0).toLocaleString("vi-VN")}</span>
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
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
      <AdminPagination
        currentPage={current}
        totalPages={totalPages}
        totalItems={items.length}
        pageSize={pageSize}
        itemLabel="tour"
        showSinglePage
        onPageChange={onPageChange}
      />
    </section>
  );
}
