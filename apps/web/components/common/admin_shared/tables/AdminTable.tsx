"use client";

import { AdminTableSkeleton } from "@/components/common/admin_shared/tables/AdminTableSkeleton";

import { AdminIconActionButton } from "@/components/common/admin_shared/controls/AdminIconActionButton";
import { AdminPagination } from "@/components/common/admin_shared/tables/AdminPagination";
import { Edit, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { AdminTableProps } from 'shared';

function getAlignmentClass(alignment?: "left" | "center" | "right") {
  if (alignment === "center") return "text-center";
  if (alignment === "right") return "text-right";
  return "text-left";
}

/** Hiển thị bảng dữ liệu với phân trang và các thao tác trên từng dòng. */
export function AdminTable<T>({
  items,
  columns,
  loading,
  emptyMessage = "Không có dữ liệu",
  onEdit,
  onDelete,
  rowKey,
  pageSize = 10,
  itemLabel = "mục",
  extraActions = [],
}: AdminTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const hasActions = Boolean(onEdit || onDelete || extraActions.length);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  if (loading) {
    return (
      <AdminTableSkeleton
        columnCount={columns.length}
        showActions={hasActions}
      />
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-[14px] border border-[#e1edfc] bg-white p-12 text-center font-medium italic text-slate-400 shadow-2xs">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-[#e1edfc] bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#edf2fb] bg-slate-50/75 text-[12px] font-[650] text-[#7387aa] uppercase tracking-wider">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-3.5 py-2.5 font-bold ${getAlignmentClass(column.align)} ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}
              {hasActions ? (
                <th className="w-[110px] whitespace-nowrap px-3.5 py-2.5 text-right font-bold">
                  Thao tác
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf2fb] text-[13px]">
            {paginatedItems.map((item, index) => (
              <tr
                key={rowKey(item)}
                className="group transition-colors hover:bg-slate-50/60"
              >
                {columns.map((column, columnIndex) => (
                  <td
                    key={columnIndex}
                    className={`px-3.5 py-2.5 ${getAlignmentClass(column.align)} ${column.className || ""}`}
                  >
                    {column.render(item, (page - 1) * pageSize + index)}
                  </td>
                ))}
                {hasActions ? (
                  <td className="w-[110px] whitespace-nowrap px-3.5 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                      {onEdit ? (
                        <AdminIconActionButton
                          onClick={() => onEdit(item)}
                          icon={<Edit size={16} />}
                          title="Chỉnh sửa"
                        />
                      ) : null}
                      {extraActions.map((action, actionIndex) => (
                        <AdminIconActionButton
                          key={`${rowKey(item)}-${actionIndex}`}
                          onClick={() => action.onClick(item)}
                          icon={
                            typeof action.icon === "function"
                              ? action.icon(item)
                              : action.icon
                          }
                          title={
                            typeof action.title === "function"
                              ? action.title(item)
                              : action.title
                          }
                          tone={action.tone}
                        />
                      ))}
                      {onDelete ? (
                        <AdminIconActionButton
                          onClick={() => onDelete(item)}
                          icon={<Trash2 size={16} />}
                          title="Xóa"
                          tone="danger"
                        />
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={items.length}
        pageSize={pageSize}
        itemLabel={itemLabel}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
