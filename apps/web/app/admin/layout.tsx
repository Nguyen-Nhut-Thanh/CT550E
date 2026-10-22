"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
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
          <AdminTopbar onMenuClick={() => setSidebarOpen((open) => !open)} />

          <main className="admin-content-scroll flex-1 min-h-0">
            <div className={isChatWorkspace ? "h-full w-full" : pathname === "/admin" ? "mx-auto w-full max-w-[1720px] p-4 lg:p-6" : "mx-auto w-full max-w-[1520px] p-6 md:p-8"}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
