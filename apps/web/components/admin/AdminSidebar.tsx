"use client";

import { removeToken } from "@/lib/auth/session";
import { NavigationPending } from "@/components/common/NavigationPending";
import { ArrowLeft, Briefcase, CalendarDays, Compass, FileText, Image as ImageIcon, LayoutDashboard, LogOut, Map, MapPin, MessageSquare, Star, Ticket, Users, Zap, } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  {
    group: "Điều hướng",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Quản lý Tour", href: "/admin/tours", icon: Map },
      { name: "Lịch khởi hành", href: "/admin/schedules", icon: CalendarDays },
      { name: "Quản lý Địa điểm", href: "/admin/locations", icon: MapPin },
      { name: "Địa điểm yêu thích", href: "/admin/locations/featured", icon: Star },
      { name: "Quản lý Booking", href: "/admin/bookings", icon: Briefcase },
    ],
  },
  {
    group: "Khách hàng & Marketing",
    items: [
      { name: "Người dùng", href: "/admin/users", icon: Users },
      { name: "Flash Deals", href: "/admin/marketing/flash-deals", icon: Zap },
      { name: "Mã giảm giá", href: "/admin/marketing/vouchers", icon: Ticket },
      { name: "Bài viết", href: "/admin/marketing/posts", icon: FileText },
    ],
  },
  {
    group: "Nội dung & Giao tiếp",
    items: [
      { name: "Quản lý Banner", href: "/admin/banners", icon: ImageIcon },
      { name: "Hỗ trợ khách hàng", href: "/admin/chats", icon: MessageSquare },
    ],
  },
];

export const AdminSidebar = ({ open = false, onClose }: { open?: boolean; onClose?: () => void }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("admin_auth_status");
      window.sessionStorage.removeItem("admin_auth_message");
    }
    router.replace("/admin/login");
  };

  return (
    <aside className={`admin-navigation ${open ? "flex" : "hidden"} fixed left-0 top-0 z-40 h-dvh w-64 flex-shrink-0 flex-col overflow-hidden border-r border-slate-800 bg-slate-900 text-slate-300 shadow-xl lg:sticky lg:flex`}>
      <div className="flex h-16 items-center border-b border-slate-800 bg-slate-950 px-6">
        <div className="flex items-center gap-3 text-xl font-black tracking-wide text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600"><Compass size={23} /></span>
          <div><div className="flex items-center gap-3">TRAVOL <span className="rounded-full bg-blue-500/25 px-2 py-0.5 text-[9px] tracking-normal text-blue-100">ADMIN</span></div><p className="mt-0.5 text-[10px] font-normal tracking-normal text-blue-300/70">Travel Management System</p></div>
        </div>
      </div>

      <div className="p-4">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-white/10"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 transition-transform group-hover:scale-110">
            <ArrowLeft size={16} />
          </div>
          Quay lại website
        </Link>
      </div>

      <div className="admin-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {menuItems.map((group) => (
          <div key={group.group} className="mb-6">
            <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {group.group}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href ||
                      (pathname.startsWith(`${item.href}/`) &&
                        !menuItems.some((menuGroup) =>
                          menuGroup.items.some(
                            (menuItem) =>
                              menuItem.href !== item.href &&
                              menuItem.href.startsWith(item.href) &&
                              pathname.startsWith(menuItem.href),
                          ),
                        ));

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                          : "hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <item.icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                      {item.name}
                      <NavigationPending />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800 bg-slate-950 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};
