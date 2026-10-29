"use client";

import type { AdminPaginationProps } from "shared";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPaginationPages } from "@/lib/utils/pagination";

/** Hiển thị phân trang và số lượng mục trong danh sách. */
export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemLabel = "mục",
  variant = "simple",
  showSinglePage = false,
  onPageChange,
}: AdminPaginationProps) {
  if (totalPages <= 1 && !showSinglePage) return null;

  const start = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, totalItems);

  if (variant === "numbered") {
    const pages = getPaginationPages(currentPage, totalPages);
    return (
      <div className="ui-admin-pagination-pagination flex items-center justify-between flex-wrap gap-[10px] p-[14px_16px] [border-top:1px_solid_#edf2fa] text-[#6c84ae] text-[12px] [&_nav]:flex [&_nav]:items-center [&_nav]:gap-[4px] [&_button]:grid [&_button]:place-items-center [&_button]:min-w-[28px] [&_button]:h-[30px] [&_button]:p-[0_5px] [&_button]:[border:1px_solid_#e2eafa] [&_button]:rounded-[8px] [&_button]:[background:#fff] [&_button]:text-[#47689c] [&_button]:text-[12px] [&_button]:[transition:background_.15s,color_.15s] [&_button:hover:enabled]:text-[#075bff] [&_button:hover:enabled]:[background:#edf4ff] [&_button:hover:enabled]:[border-color:#bcd4ff] [&_button[aria-current=page]]:[background:#075bff] [&_button[aria-current=page]]:[border-color:#075bff] [&_button[aria-current=page]]:text-[#fff] [&_button[aria-current=page]:hover:enabled]:[background:#0646ce] [&_button[aria-current=page]:hover:enabled]:[border-color:#0646ce] [&_button[aria-current=page]:hover:enabled]:text-[#fff] [&_button:disabled]:opacity-[.35] [&_button:disabled]:cursor-not-allowed [&_button:focus-visible]:[outline:2px_solid_#3b82f6] [&_button:focus-visible]:outline-offset-[2px]">
        <p>
          Hiển thị {start}–{end} / {totalItems} {itemLabel}
        </p>
        <nav aria-label={`Phân trang ${itemLabel}`}>
          <button
            type="button"
            aria-label="Trang trước"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft size={15} />
          </button>
          {pages.map((page, index) => (
            <span
              key={page}
              className="ui-admin-pagination-group flex items-center gap-[4px]"
            >
              {index > 0 && page - pages[index - 1] > 1 && (
                <span className="ui-admin-pagination-ellipsis p-[0_3px]">
                  …
                </span>
              )}
              <button
                type="button"
                aria-label={`Trang ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            </span>
          ))}
          <button
            type="button"
            aria-label="Trang sau"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight size={15} />
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-500">
        Hiển thị {start}-{end} / {totalItems} {itemLabel}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Trước
        </button>
        <span className="min-w-[96px] text-center text-sm font-bold text-slate-700">
          Trang {currentPage}/{totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
