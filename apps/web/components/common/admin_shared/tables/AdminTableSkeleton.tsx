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
    <div className="overflow-hidden rounded-[14px] border border-[#e1edfc] bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#edf2fb] bg-slate-50/75 text-[12px] font-[650] text-[#7387aa] uppercase tracking-wider">
              {Array.from({ length: totalColumns }).map((_, index) => (
                <th key={index} className="px-3.5 py-2.5">
                  <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf2fb] text-[13px]">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: totalColumns }).map((__, columnIndex) => (
                  <td key={columnIndex} className="px-3.5 py-2.5">
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
