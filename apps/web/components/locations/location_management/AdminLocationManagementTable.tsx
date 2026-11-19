"use client";

import Link from "next/link";
import { useState } from "react";
import { Layers, MapPin, Pencil, Star, Trash2 } from "lucide-react";
import { AdminPagination } from "@/components/common/admin_shared/tables/AdminPagination";
import { AdminRowActions } from "@/components/common/admin_shared/tables/AdminRowActions";
import { ImageWithFallback } from "@/components/common/dialogs_and_feedback/media/ImageWithFallback";
import { getLocationLevelLabel } from "@/lib/locations/admin/hierarchy";
import type { LocationItem } from "shared";

export function LocationManagementTable({
  items,
  loading,
  deletingId,
  onDelete,
}: {
  items: LocationItem[];
  loading: boolean;
  deletingId: number | null;
  onDelete: (item: LocationItem) => void;
}) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, totalPages);
  const visible = items.slice((current - 1) * pageSize, current * pageSize);

  const getLevelBadge = (levelId: number, levelName: string) => {
    const label = getLocationLevelLabel(levelId, levelName);
    switch (levelId) {
      case 3:
        return (
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-blue-700">
            {label}
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-sky-700">
            {label}
          </span>
        );
      case 5:
        return (
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-emerald-700">
            {label}
          </span>
        );
      case 6:
        return (
          <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-purple-700">
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-slate-600">
            {label}
          </span>
        );
    }
  };

  return (
    <section
      className="ui-location-management-tableCard overflow-hidden min-w-0 rounded-[14px] border border-[#e1edfc] bg-white shadow-xs"
      aria-label="Danh sách địa điểm"
      aria-busy={loading}
    >
      <div className="ui-location-management-tableScroll overflow-x-auto">
        <table className="w-full border-collapse text-left whitespace-nowrap text-xs">
          <thead>
            <tr className="bg-slate-50/75 border-b border-[#edf2fb]">
              {[
                "Địa điểm",
                "Cấp độ",
                "Thuộc cấp cha",
                "Nổi bật",
                "Slug",
                "Cập nhật",
                "Thao tác",
              ].map((label) => (
                <th
                  scope="col"
                  key={label}
                  className="px-4.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#7187a9]"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf2fb]">
            {loading
              ? Array.from({ length: 10 }, (_, index) => (
                  <tr key={index} aria-hidden="true">
                    {Array.from({ length: 7 }, (_, column) => (
                      <td key={column} className="px-4.5 py-3">
                        <span className="block h-[38px] min-w-[36px] bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 rounded-lg animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : visible.map((item) => {
                  const updated = item.updated_at
                    ? new Date(item.updated_at)
                    : null;
                  const validDate = updated && !Number.isNaN(updated.getTime());
                  return (
                    <tr
                      key={item.location_id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4.5 py-3">
                        <Link
                          href={`/admin/locations/${item.location_id}`}
                          className="group flex items-center gap-3 min-w-[240px] max-w-[400px]"
                        >
                          <ImageWithFallback
                            src={
                              item.location_images?.[0]?.image_url ||
                              item.featured_image ||
                              undefined
                            }
                            alt={item.name}
                            className="w-[54px] h-[39px] shrink-0 object-cover rounded-lg border border-[#e1edfc] bg-[#eaf2fc]"
                          />
                          <div className="min-w-0">
                            <strong
                              title={item.name}
                              className="block overflow-hidden text-ellipsis text-[13px] font-bold text-[#07123e] group-hover:text-[#075bff] transition-colors mb-0.5"
                            >
                              {item.name}
                            </strong>
                            <span
                              title={item.note ?? undefined}
                              className="block max-w-[300px] overflow-hidden text-ellipsis text-[11px] text-[#7187a9]"
                            >
                              {item.note || "Chưa có mô tả"}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4.5 py-3">
                        {getLevelBadge(
                          item.level_id,
                          item.geographic_levels?.name ?? "",
                        )}
                      </td>
                      <td className="px-4.5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#526b92]">
                          {item.locations?.name && (
                            <Layers size={14} className="text-[#8ea5c5]" />
                          )}
                          {item.locations?.name || "Không có cấp cha"}
                        </span>
                      </td>
                      <td className="px-4.5 py-3">
                        {item.is_featured ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                            <Star
                              size={11}
                              className="text-amber-500 fill-amber-500"
                            />
                            Nổi bật
                          </span>
                        ) : (
                          <span className="text-[#bac9de]">—</span>
                        )}
                      </td>
                      <td className="px-4.5 py-3">
                        <span
                          className="block max-w-[180px] overflow-hidden text-ellipsis text-xs font-mono text-[#7187a9]"
                          title={item.slug}
                        >
                          {item.slug}
                        </span>
                      </td>
                      <td className="px-4.5 py-3">
                        {validDate ? (
                          <time
                            dateTime={item.updated_at!}
                            className="text-xs text-[#526b92]"
                          >
                            {updated.toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                            <small className="block text-[11px] text-[#8da1bd] mt-0.5">
                              {updated.toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </small>
                          </time>
                        ) : (
                          <span className="text-[#bac9de]">—</span>
                        )}
                      </td>
                      <td className="px-4.5 py-3 text-center">
                        <AdminRowActions
                          label={`Thao tác với ${item.name}`}
                          disabled={deletingId === item.location_id}
                          actions={[
                            {
                              label: "Chỉnh sửa địa điểm",
                              icon: <Pencil size={16} />,
                              href: `/admin/locations/${item.location_id}`,
                            },
                            {
                              label: "Thiết lập grid nổi bật",
                              icon: <Star size={16} />,
                              href: "/admin/banners?tab=featured",
                            },
                            {
                              label: "Xóa địa điểm",
                              icon: <Trash2 size={16} />,
                              danger: true,
                              onClick: () => onDelete(item),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
      {!loading && !items.length && (
        <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-[#075bff] shadow-xs">
            <MapPin size={24} />
          </div>
          <strong className="text-sm font-bold text-[#07123e] mt-2">
            Không tìm thấy địa điểm phù hợp
          </strong>
          <p className="text-xs text-[#7187a9]">Thử thay đổi từ khóa hoặc bộ lọc.</p>
        </div>
      )}
      {!loading && (
        <AdminPagination
          variant="numbered"
          showSinglePage
          currentPage={current}
          totalPages={totalPages}
          totalItems={items.length}
          pageSize={pageSize}
          itemLabel="địa điểm"
          onPageChange={setPage}
        />
      )}
    </section>
  );
}
