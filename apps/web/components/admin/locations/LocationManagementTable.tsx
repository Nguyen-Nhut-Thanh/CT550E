"use client";

import Link from "next/link";
import { useState } from "react";
import { Layers, MapPin, Pencil, Star, Trash2 } from "lucide-react";
import { AdminPagination } from "@/components/common/AdminPagination";
import { AdminRowActions } from "@/components/common/AdminRowActions";
import CustomDropdown from "@/components/common/CustomDropdown";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { getLocationLevelLabel } from "@/lib/admin/locations/hierarchy";
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
  const [pageSize, setPageSize] = useState(8);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, totalPages);
  const visible = items.slice((current - 1) * pageSize, current * pageSize);
  return (
    <section
      className="ui-location-management-tableCard overflow-hidden min-w-0 rounded-[14px] [background:white] [border:1px_solid_#e4edf9] [box-shadow:0_8px_25px_#497bac04]"
      aria-label="Danh sách địa điểm"
      aria-busy={loading}
    >
      <div className="ui-location-management-tableScroll overflow-x-auto">
        <table className="ui-location-management-table w-full border-collapse text-left whitespace-nowrap text-[12px] [&_th]:[background:linear-gradient(#fcfdff,#f5f8fc)] [&_th]:p-[14px_18px] [&_th]:text-[10px] [&_th]:font-[650] [&_th]:text-[#7187a9] [&_th]:uppercase [&_th]:tracking-[.2px]! [&_th]:[border-bottom:1px_solid_#e8eff8] [&_td]:p-[10px_18px] [&_td]:[border-bottom:1px_solid_#edf2f9] [&_td]:[vertical-align:middle] [&_td:last-child]:text-center [&_th:last-child]:text-center [&_tbody_tr:hover]:[background:#f8fbff] admin-max-750:[&_td]:pl-[14px] admin-max-750:[&_td]:pr-[14px] admin-max-750:[&_th]:pl-[14px] admin-max-750:[&_th]:pr-[14px]">
          <thead>
            <tr>
              {[
                "Địa điểm",
                "Cấp độ",
                "Thuộc cấp cha",
                "Nổi bật",
                "Slug",
                "Cập nhật",
                "Thao tác",
              ].map((label) => (
                <th scope="col" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }, (_, index) => (
                  <tr key={index} aria-hidden="true">
                    {Array.from({ length: 7 }, (_, column) => (
                      <td key={column}>
                        <span className="ui-location-management-skeleton block h-[39px] min-w-[35px] [background:linear-gradient(90deg,#f0f5fa,#fafcff,#f0f5fa)] [background-size:200%_100%] rounded-[7px] animate-admin-shimmer motion-reduce:animate-none" />
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
                    <tr key={item.location_id}>
                      <td>
                        <Link
                          href={`/admin/locations/${item.location_id}`}
                          className="ui-location-management-locationInfo flex items-center gap-[12px] min-w-[235px] max-w-[390px] [&>div]:min-w-0 [&_strong]:block [&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_strong]:text-[13px] [&_strong]:font-bold [&_strong]:text-[#192e52] [&_strong]:mb-[4px] [&:hover_strong]:text-[#075bff] [&_span]:block [&_span]:max-w-[290px] [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:text-[#899cba] [&_span]:text-[11px]"
                        >
                          <ImageWithFallback
                            src={
                              item.location_images?.[0]?.image_url ||
                              item.featured_image ||
                              undefined
                            }
                            alt={item.name}
                            className="ui-location-management-thumbnail w-[54px] h-[39px] shrink-0 object-cover rounded-[7px] [background:#eaf2fc]"
                          />
                          <div>
                            <strong title={item.name}>{item.name}</strong>
                            <span title={item.note ?? undefined}>
                              {item.note || "Chưa có mô tả"}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <span
                          className="ui-location-management-level inline-block [border:1px_solid_#e1e8ff] [background:#eef2ff] text-[#6374bb] p-[5px_9px] rounded-[20px] text-[9px] font-[650] uppercase [&[data-level='5']]:[border-color:#d6f2e6] [&[data-level='5']]:[background:#e8fbf2] [&[data-level='5']]:text-[#07906f] [&[data-level='6']]:[border-color:#eadfff] [&[data-level='6']]:[background:#f3ecff] [&[data-level='6']]:text-[#894ad1]"
                          data-level={item.level_id}
                        >
                          {getLocationLevelLabel(
                            item.level_id,
                            item.geographic_levels?.name ?? "",
                          )}
                        </span>
                      </td>
                      <td>
                        <span className="ui-location-management-parent inline-flex items-center gap-[8px] text-[#6780a4] [&_svg]:text-[#8ea5c5]">
                          {item.locations?.name && <Layers size={14} />}
                          {item.locations?.name || "Không có cấp cha"}
                        </span>
                      </td>
                      <td>
                        {item.is_featured ? (
                          <span className="ui-location-management-featured inline-flex items-center gap-[5px] [border:1px_solid_#ffedc3] rounded-[20px] p-[5px_9px] [background:#fff9e9] text-[#dd930b] text-[9px] font-[650] uppercase">
                            <Star size={11} fill="currentColor" />
                            Nổi bật
                          </span>
                        ) : (
                          <span className="ui-location-management-dash text-[#bac9de]">
                            —
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className="ui-location-management-slug block max-w-[180px] overflow-hidden text-ellipsis text-[#7d92b4] text-[11px]"
                          title={item.slug}
                        >
                          {item.slug}
                        </span>
                      </td>
                      <td>
                        {validDate ? (
                          <time
                            dateTime={item.updated_at!}
                            className="ui-location-management-updated text-[#637ea8] text-[11px] [&_small]:block [&_small]:text-[10px] [&_small]:text-[#8da1bd] [&_small]:mt-[4px]"
                          >
                            {updated.toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                            <small>
                              {updated.toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </small>
                          </time>
                        ) : (
                          <span className="ui-location-management-dash text-[#bac9de]">
                            —
                          </span>
                        )}
                      </td>
                      <td>
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
                              href: "/admin/locations/featured",
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
        <div className="ui-location-management-empty flex flex-col items-center gap-[10px] p-[50px_16px] text-[#8b9db6] text-center [&_strong]:text-[#5d7699] [&_strong]:text-[14px] [&_p]:text-[12px]">
          <MapPin size={34} />
          <strong>Không tìm thấy địa điểm phù hợp</strong>
          <p>Thử thay đổi từ khóa hoặc bộ lọc.</p>
        </div>
      )}
      {!loading && (
        <footer className="ui-location-management-footer flex items-center gap-[16px] pr-[16px] [&>div]:[flex:1] [&>div]:[border-top:0] [&>div]:min-w-0 [&>.ui-location-management-pageSize]:[flex:0_0_auto] admin-max-1250:flex-wrap admin-max-1250:gap-[0] admin-max-1250:pr-[0] admin-max-750:block">
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
          <div className="ui-location-management-pageSize flex items-center gap-[7px] text-[#738aab] text-[11px] whitespace-nowrap [&>div]:flex [&>div]:items-center [&>div]:gap-[7px] [&_label]:m-[0] [&_label]:text-[11px] [&_label]:text-[#738aab] [&_label]:whitespace-nowrap [&>div>div]:w-[160px] [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:[border:1px_solid_#e3ebf9] [&_button[aria-haspopup=listbox]]:[background:white] [&_button[aria-haspopup=listbox]]:text-[#59769d] [&_button[aria-haspopup=listbox]]:rounded-[8px] [&_button[aria-haspopup=listbox]]:p-[7px_9px] [&_button[aria-haspopup=listbox]]:text-[11px] admin-max-1250:ml-[auto] admin-max-1250:p-[0_16px_12px] admin-max-750:justify-end">
            <CustomDropdown
              label="Hiển thị"
              placeholder="Số địa điểm mỗi trang"
              variant="compact"
              matchTriggerWidth
              selectedValue={String(pageSize)}
              onSelect={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
              options={[8, 15, 30].map((size) => ({
                value: String(size),
                label: `${size} / trang`,
              }))}
            />
          </div>
        </footer>
      )}
    </section>
  );
}
