"use client";

export function ScheduleTableSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[minmax(0,2fr)_120px_160px_120px] items-center gap-4 rounded-2xl border border-slate-100 px-4 py-5"
        >
          <div className="space-y-2">
            <div className="h-4 w-44 animate-pulse rounded-full bg-slate-200" />
            <div className="h-3 w-28 animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="h-4 w-16 animate-pulse rounded-full bg-slate-100" />
          <div className="h-4 w-24 animate-pulse rounded-full bg-slate-100" />
          <div className="ml-auto h-9 w-24 animate-pulse rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
