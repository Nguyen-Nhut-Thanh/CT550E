export default function FlashDealCardSkeleton() {
  return (
    <div className="w-[280px] flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:w-[300px] lg:w-[310px]">
      <div className="h-48 animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-6 animate-pulse rounded bg-slate-200" />
        <div className="h-4 animate-pulse rounded bg-slate-100" />
        <div className="h-4 animate-pulse rounded bg-slate-100" />
        <div className="h-4 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 h-12 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
