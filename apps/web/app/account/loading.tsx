import { Loader2 } from "lucide-react";

export default function AccountLoading() {
  return <div role="status" className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-slate-500"><Loader2 size={22} className="animate-spin text-blue-600" />Đang tải nội dung...</div>;
}
