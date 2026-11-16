export default function TourListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className="aspect-[16/9] animate-pulse rounded-xl bg-slate-200 md:aspect-auto md:h-52" />
            <div className="flex flex-col justify-between space-y-3 py-1">
              <div className="space-y-2">
                <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="h-7 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
