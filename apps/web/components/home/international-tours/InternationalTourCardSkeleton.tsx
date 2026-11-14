export default function InternationalTourCardSkeleton() {
  return (
    <div className="flex h-[240px] w-full max-w-[560px] min-w-0 shrink-0 animate-pulse overflow-hidden rounded-[20px] border border-blue-100 bg-white max-sm:h-[300px] max-sm:flex-col">
      <div className="h-full w-[36%] bg-slate-200 max-sm:h-32 max-sm:w-full" />
      <div className="flex flex-1 flex-col justify-between p-3">
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded bg-slate-200" />
          <div className="h-5 w-full rounded bg-slate-100" />
          <div className="h-12 rounded-xl bg-blue-50" />
          <div className="h-4 w-32 rounded bg-slate-100" />
        </div>
        <div className="flex items-end justify-between border-t border-slate-100 pt-4">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-slate-100" />
          <div className="h-6 w-32 rounded bg-slate-200" />
          </div>
        <div className="h-9 w-24 rounded-full bg-blue-100" />
        </div>
      </div>
    </div>
  );
}
