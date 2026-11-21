export default function DomesticTourCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex h-[260px] w-full max-w-[560px] min-w-0 animate-pulse gap-3 overflow-hidden rounded-[20px] border border-blue-100 bg-[radial-gradient(ellipse_at_100%_20%,#e7f0ff_0%,transparent_35%),linear-gradient(135deg,#fff_40%,#f8fbff_100%)] p-3 shadow-[0_10px_28px_rgba(29,78,216,0.08)] max-sm:h-auto max-sm:flex-col">
      <div className="relative h-full w-[34%] shrink-0 rounded-[14px_14px_40px_14px] bg-sky-100 max-sm:aspect-[16/10] max-sm:h-auto max-sm:w-full">
        <div className="absolute inset-0 bottom-1 right-1 rounded-[14px_14px_40px_14px] bg-slate-200" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 max-sm:min-h-[220px]">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 rounded-full bg-blue-50" />
            <div className="h-8 w-8 rounded-full bg-slate-100" />
          </div>
          <div className="h-9 w-3/4 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-11 rounded-xl bg-blue-50/70" />
          <div className="h-4 w-28 rounded bg-slate-100" />
        </div>
        <div className="flex items-end justify-between border-t border-blue-100/80 pt-2">
          <div className="h-6 w-24 rounded bg-slate-200" />
          <div className="h-9 w-24 rounded-full bg-blue-100" />
        </div>
      </div>
    </div>
  );
}
