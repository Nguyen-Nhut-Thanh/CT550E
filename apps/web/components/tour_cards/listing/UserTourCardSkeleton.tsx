export interface TourCardSkeletonProps {
  variant?: "horizontal" | "vertical" | "grid";
  className?: string;
}

export function TourCardSkeleton({ variant = "horizontal", className = "" }: TourCardSkeletonProps) {
  if (variant === "vertical" || variant === "grid") {
    return (
      <div className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm animate-pulse ${className}`}>
        <div className="aspect-[16/9] w-full bg-slate-200" />
        <div className="space-y-3 p-4">
          <div className="h-5 w-3/4 rounded bg-slate-200" />
          <div className="h-4 w-1/2 rounded bg-slate-100" />
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-5/6 rounded bg-slate-100" />
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="h-6 w-28 rounded bg-slate-200" />
            <div className="h-8 w-24 rounded-full bg-blue-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-[300px] w-full max-w-[560px] min-w-0 flex-col overflow-hidden rounded-[20px] border border-blue-100 bg-white shadow-[0_10px_28px_rgba(29,78,216,0.08)] sm:h-[240px] sm:flex-row animate-pulse ${className}`}>
      <div className="h-32 bg-slate-200 sm:h-full sm:w-[36%]" />
      <div className="flex flex-1 flex-col justify-between gap-3 p-3">
        <div className="space-y-3">
          <div className="h-7 w-32 rounded-full bg-blue-50" />
          <div className="h-7 w-3/4 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-14 rounded-2xl bg-blue-50/70" />
        </div>
        <div className="flex items-end justify-between border-t border-slate-100 pt-4">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-slate-100" />
            <div className="h-7 w-36 rounded bg-slate-200" />
          </div>
          <div className="h-10 w-28 rounded-full bg-blue-100" />
        </div>
      </div>
    </div>
  );
}

export default TourCardSkeleton;

