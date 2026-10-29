"use client";

export function TourListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="space-y-2 rounded-2xl border border-slate-100 bg-white px-4 py-3"
        >
          <div className="h-3 w-14 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
