"use client";

/** Hiển thị khung bảng trong khi dữ liệu đang tải. */
export function AdminTableSkeleton({
  columnCount,
  showActions,
}: {
  columnCount: number;
  showActions: boolean;
}) {
  const totalColumns = showActions ? columnCount + 1 : columnCount;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
              {Array.from({ length: totalColumns }).map((_, index) => (
                <th key={index} className="px-6 py-4">
                  <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: totalColumns }).map((__, columnIndex) => (
                  <td key={columnIndex} className="px-6 py-5">
                    <div
                      className={`animate-pulse rounded-full bg-slate-100 ${
                        columnIndex === 0 ? "h-4 w-40" : "h-4 w-24"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
