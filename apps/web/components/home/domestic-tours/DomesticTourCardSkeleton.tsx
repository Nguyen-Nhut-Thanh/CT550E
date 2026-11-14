export default function DomesticTourCardSkeleton() {
  return (
    <div className="flex h-[300px] w-full max-w-[560px] min-w-0 flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_10px_28px_rgba(29,78,216,0.08)] sm:h-[240px] sm:flex-row">
      <div className="h-32 animate-pulse bg-slate-200 sm:h-full sm:w-[36%]" />
      <div className="flex flex-1 flex-col justify-between gap-3 p-3">
        <div className="space-y-3">
          <div className="h-7 w-32 animate-pulse rounded-full bg-blue-50" />
          <div className="h-7 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-16 animate-pulse rounded-2xl bg-blue-50/70" />
        </div>
        <div className="flex items-end justify-between border-t border-slate-100 pt-4">
          <div className="space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
            <div className="h-7 w-36 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-10 w-28 animate-pulse rounded-full bg-blue-100" />
        </div>
      </div>
    </div>
  );
}
