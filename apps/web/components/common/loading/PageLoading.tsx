import { Loader2 } from "lucide-react";

/** Hiển thị trạng thái chờ khi nội dung của trang mới đang được tải. */
export function PageLoading() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[40vh] items-center justify-center gap-3 px-6 text-sm text-slate-500">
      <Loader2 size={22} aria-hidden="true" className="animate-spin text-blue-600 motion-reduce:animate-none" />
      Đang tải nội dung...
    </div>
  );
}
