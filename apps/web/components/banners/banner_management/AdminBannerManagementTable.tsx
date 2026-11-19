"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays, Eye, EyeOff, ImageIcon } from "lucide-react";
import { AdminPagination } from "@/components/common/admin_shared/tables/AdminPagination";
import { ImageWithFallback } from "@/components/common/dialogs_and_feedback/media/ImageWithFallback";
import { BannerRowActions } from "@/components/banners/banner_management/AdminBannerRowActions";
import type { Banner } from "shared";

export function BannerManagementTable({
  items,
  loading,
  busyIds,
  page: controlledPage,
  onPageChange,
  onToggle,
  onDuplicate,
  onDelete,
  onBulkStatus,
}: {
  items: Banner[];
  loading: boolean;
  busyIds: Set<number>;
  page?: number;
  onPageChange?: (page: number) => void;
  onToggle: (item: Banner) => void;
  onDuplicate: (item: Banner) => void;
  onDelete: (item: Banner) => void;
  onBulkStatus: (ids: number[], status: number) => Promise<void>;
}) {
  const pageSize = 10;
  const [internalPage, setInternalPage] = useState(1);
  const page = controlledPage ?? internalPage;
  const setPage = onPageChange ?? setInternalPage;
  const [selected, setSelected] = useState<number[]>([]);
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const selectAll = useRef<HTMLInputElement>(null);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, totalPages);
  const visible = items.slice((current - 1) * pageSize, current * pageSize);
  const allSelected =
    visible.length > 0 &&
    visible.every((item) => selected.includes(item.banner_id));
  const selectedItems = items.filter((item) =>
    selected.includes(item.banner_id),
  );
  useEffect(() => {
    if (selectAll.current)
      selectAll.current.indeterminate =
        !allSelected &&
        visible.some((item) => selected.includes(item.banner_id));
  }, [visible, selected, allSelected]);

  useEffect(() => {
    if (page > totalPages && totalPages >= 1) {
      setPage(totalPages);
    }
  }, [page, totalPages, setPage]);
  const bulkBusy = selectedItems.some((item) => busyIds.has(item.banner_id));
  return (
    <section className="overflow-hidden rounded-[14px] border border-[#e1edfc] bg-white shadow-2xs">
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-[#e1edfc] bg-blue-50/70 px-4 py-2.5 text-xs text-blue-700">
          <span className="font-semibold">
            Đã chọn {selectedItems.length} banner
          </span>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() =>
              void onBulkStatus(
                selectedItems.map((item) => item.banner_id),
                1,
              )
            }
            className="rounded-lg border border-[#e1edfc] bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-50 disabled:opacity-40 cursor-pointer"
          >
            Hiển thị
          </button>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() =>
              void onBulkStatus(
                selectedItems.map((item) => item.banner_id),
                0,
              )
            }
            className="rounded-lg border border-[#e1edfc] bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-50 disabled:opacity-40 cursor-pointer"
          >
            Ẩn
          </button>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="ml-auto font-medium hover:underline cursor-pointer"
          >
            Bỏ chọn
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-xs text-slate-700">
          <thead className="border-b border-[#e1edfc] bg-[#f8fbff] text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th className="w-10 px-3.5 py-2.5">
                <input
                  ref={selectAll}
                  type="checkbox"
                  aria-label="Chọn tất cả banner trên trang"
                  checked={allSelected}
                  disabled={loading || !visible.length}
                  onChange={() =>
                    setSelected((current) =>
                      allSelected
                        ? current.filter(
                            (id) =>
                              !visible.some((item) => item.banner_id === id),
                          )
                        : Array.from(
                            new Set([
                              ...current,
                              ...visible.map((item) => item.banner_id),
                            ]),
                          ),
                    )
                  }
                  className="h-3.5 w-3.5 rounded accent-blue-600 cursor-pointer"
                />
              </th>
              {[
                "Hình ảnh",
                "Tiêu đề",
                "Vị trí hiển thị",
                "Thứ tự",
                "Trạng thái",
                "Thời gian tạo",
                "Thao tác",
              ].map((label) => (
                <th key={label} className="whitespace-nowrap px-3.5 py-2.5">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-slate-400">
                  Đang tải banner…
                </td>
              </tr>
            ) : !visible.length ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-slate-400">
                  Không tìm thấy banner phù hợp.
                </td>
              </tr>
            ) : (
              visible.map((item, index) => {
                const busy = busyIds.has(item.banner_id);
                const date = new Date(item.created_at);
                const validDate = !Number.isNaN(date.getTime());
                return (
                  <tr
                    key={item.banner_id}
                    className={`border-b border-[#edf2fb] last:border-b-0 transition-colors hover:bg-[#f8fbff] ${selected.includes(item.banner_id) ? "bg-blue-50/50" : ""}`}
                  >
                    <td className="w-10 px-3.5 py-2.5">
                      <input
                        type="checkbox"
                        checked={selected.includes(item.banner_id)}
                        aria-label={`Chọn ${item.header}`}
                        onChange={() =>
                          setSelected((current) =>
                            current.includes(item.banner_id)
                              ? current.filter((id) => id !== item.banner_id)
                              : [...current, item.banner_id],
                          )
                        }
                        className="h-3.5 w-3.5 rounded accent-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="w-32 px-3.5 py-2.5">
                      <ImageWithFallback
                        src={item.image_url}
                        alt={item.header}
                        loading="lazy"
                        className="h-[56px] w-[110px] rounded-lg border border-[#e1edfc] object-cover"
                        onLoad={(e) => {
                          const image = e.currentTarget;
                          if (
                            image.getAttribute("src") === item.image_url &&
                            image.naturalWidth
                          )
                            setSizes((current) => ({
                              ...current,
                              [item.image_url]: `${image.naturalWidth} × ${image.naturalHeight}`,
                            }));
                        }}
                      />
                    </td>
                    <td className="min-w-56 max-w-72 px-3.5 py-2.5">
                      <Link
                        href={`/admin/banners/${item.banner_id}${current > 1 ? `?page=${current}` : ""}`}
                        className="line-clamp-1 text-[13px] font-bold text-slate-800 hover:text-blue-600"
                      >
                        {item.header || "Chưa có tiêu đề"}
                      </Link>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                        {item.description || item.location_name}
                      </p>
                      {sizes[item.image_url] && (
                        <p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                          <ImageIcon size={12} />
                          {sizes[item.image_url]}
                        </p>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="whitespace-nowrap rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                        Trang chủ
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-bold text-slate-700">
                      {(current - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            item.status === 1
                              ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                              : "border border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.status === 1 ? (
                            <Eye size={12} />
                          ) : (
                            <EyeOff size={12} />
                          )}{" "}
                          {item.status === 1 ? "Hiển thị" : "Ẩn"}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={item.status === 1}
                          aria-label={`${item.status === 1 ? "Ẩn" : "Hiển thị"} banner ${item.header}`}
                          disabled={busy}
                          onClick={() => onToggle(item)}
                          className={`relative h-[18px] w-8 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 disabled:opacity-40 cursor-pointer ${
                            item.status === 1 ? "bg-blue-600" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-xs transition-transform ${
                              item.status === 1 ? "left-0.5 translate-x-3.5" : "left-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 leading-tight">
                        <CalendarDays size={14} className="shrink-0 text-slate-400" />
                        <div>
                          {validDate ? date.toLocaleDateString("vi-VN") : "—"}
                          <p className="text-[10px] text-slate-400">
                            {validDate
                              ? date.toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <BannerRowActions
                        banner={item}
                        busy={busy}
                        page={current}
                        onToggle={onToggle}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination
        currentPage={current}
        totalPages={totalPages}
        totalItems={items.length}
        pageSize={pageSize}
        itemLabel="banner"
        variant="numbered"
        showSinglePage
        onPageChange={setPage}
      />
    </section>
  );
}
