"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isChatWorkspace = pathname.startsWith("/admin/chats");
  const isScheduleOverview = pathname === "/admin/schedules";

  if (pathname === "/admin/login") {
    return (
      <div className="min-h-screen bg-slate-950 font-sans">{children}</div>
    );
  }

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-blue-50 font-sans text-slate-900">
        {sidebarOpen && <button type="button" aria-label="Đóng menu" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" />}
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 px-4 py-2 lg:hidden">
            <button type="button" aria-label="Mở menu quản trị" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-blue-50">
              <Menu size={18} /> Menu quản trị
            </button>
          </div>

          <main className="admin-content-scroll flex-1 min-h-0">
            <div className={isChatWorkspace ? "h-full w-full" : isScheduleOverview ? "mx-auto h-full min-h-0 w-full max-w-[1520px] px-4 py-3 md:px-6" : pathname === "/admin" ? "mx-auto w-full max-w-[1720px] px-4 pb-4 pt-3 lg:px-6 lg:pb-6" : "mx-auto w-full max-w-[1520px] px-4 pb-6 pt-3 md:px-6 md:pb-8"}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
