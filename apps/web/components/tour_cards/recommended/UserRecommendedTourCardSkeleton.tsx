export function RecommendedTourCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="relative mt-5 grid w-full min-w-0 animate-pulse grid-cols-1 gap-3 rounded-[22px] border border-blue-100 bg-white p-3 shadow-sm sm:grid-cols-[34%_minmax(0,1fr)]"
    >
      <div className="absolute -top-5 left-0 h-14 w-[228px] rounded-t-[20px] bg-white px-3 py-2.5">
        <div className="h-3 w-40 rounded bg-blue-100" />
        <div className="mt-2 h-2 w-32 rounded bg-slate-100" />
      </div>
      <div className="relative mt-7 h-[180px] rounded-[14px_14px_40px_14px] bg-sky-100 sm:h-auto sm:min-h-[220px]" />
      <div className="relative flex min-w-0 flex-col gap-2">
        <div className="h-[22px] w-48 rounded-full bg-blue-50" />
        <div className="h-9 rounded bg-slate-200" />
        <div className="h-4 w-4/5 rounded bg-slate-100" />
        <div className="h-5 w-3/4 rounded-full bg-slate-100" />
        <div className="h-7 rounded-lg bg-amber-50" />
        <div className="h-11 rounded-xl bg-blue-50" />
        <div className="h-4 w-3/4 rounded bg-slate-100" />
        <div className="mt-auto flex items-end justify-between border-t border-blue-100 pt-2">
          <div className="h-9 w-28 rounded bg-slate-200" />
          <div className="h-9 w-24 rounded-full bg-blue-100" />
        </div>
      </div>
    </div>
  );
}
