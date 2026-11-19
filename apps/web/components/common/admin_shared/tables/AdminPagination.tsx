"use client";

import type { AdminPaginationProps } from "shared";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPaginationPages } from "@/lib/utils/pagination";

/** Hiển thị phân trang dạng số và số lượng mục trong danh sách. */
export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemLabel = "mục",
  showSinglePage = true,
  onPageChange,
  className,
}: AdminPaginationProps) {
  if (totalItems === 0 || (totalPages <= 1 && !showSinglePage)) return null;

  const start = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, totalItems);
  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <div className={`ui-admin-pagination-pagination flex items-center justify-between flex-wrap gap-2 px-4 py-2 border-t border-[#edf2fa] text-[#6c84ae] text-[12px] [&_nav]:flex [&_nav]:items-center [&_nav]:gap-[4px] [&_button]:grid [&_button]:place-items-center [&_button]:min-w-[28px] [&_button]:h-[28px] [&_button]:p-[0_5px] [&_button]:[border:1px_solid_#e2eafa] [&_button]:rounded-[7px] [&_button]:[background:#fff] [&_button]:text-[#47689c] [&_button]:text-[12px] [&_button]:[transition:background_.15s,color_.15s] [&_button:hover:enabled]:text-[#075bff] [&_button:hover:enabled]:[background:#edf4ff] [&_button:hover:enabled]:[border-color:#bcd4ff] [&_button[aria-current=page]]:[background:#075bff] [&_button[aria-current=page]]:[border-color:#075bff] [&_button[aria-current=page]]:text-[#fff] [&_button[aria-current=page]:hover:enabled]:[background:#0646ce] [&_button[aria-current=page]:hover:enabled]:[border-color:#0646ce] [&_button[aria-current=page]:hover:enabled]:text-[#fff] [&_button:disabled]:opacity-[.35] [&_button:disabled]:cursor-not-allowed [&_button:focus-visible]:[outline:2px_solid_#3b82f6] [&_button:focus-visible]:outline-offset-[2px] ${className ?? ""}`}>
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
