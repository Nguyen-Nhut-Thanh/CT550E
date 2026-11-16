"use client";

import { removeToken } from "@/lib/auth/client/session";
import { useAdminAccess } from "@/lib/users/account/useAdminAccess";
import { NavigationPending } from "@/components/common/navigation_layout/NavigationPending";
import {
  Bell,
  Crown,
  Gem,
  CalendarDays,
  Heart,
  LayoutDashboard,
  LogOut,
  Settings,
  Star,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AccountSidebarProps } from "shared";
import { AccountAvatar } from "@/components/users/account_profile/UserAccountAvatar";
import { useAccountResource } from "@/lib/users/account/useAccountResource";
import { getMembership } from "@/lib/membership/client/api";

const menuItems = [
  { id: "overview", label: "Trang cá nhân", icon: User, href: "/account" },
  { id: "membership", label: "Hạng thành viên", icon: Gem, href: "/account/membership" },
  {
    id: "favorites",
    label: "Tour yêu thích",
    icon: Heart,
    href: "/account/favorites",
  },
  {
    id: "bookings",
    label: "Lịch sử đặt tour",
    icon: CalendarDays,
    href: "/account/bookings",
  },
  {
    id: "reviews",
    label: "Bài đánh giá",
    icon: Star,
    href: "/account/reviews",
  },
  {
    id: "wallet",
    label: "Ví voucher & ưu đãi",
    icon: Wallet,
    href: "/account/wallet",
  },
  {
    id: "notifications",
    label: "Thông báo",
    icon: Bell,
    badge: false,
    href: "/account/notifications",
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: Settings,
    href: "/account/settings",
  },
];

export function AccountSidebar({
  activeTab,
  setActiveTab,
  user,
}: AccountSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const canAccessAdmin = useAdminAccess(user);
  const { data: membership } = useAccountResource("membership", getMembership);
  const displayName = user?.full_name?.trim() || "Người dùng";

  const handleLogout = () => {
    removeToken();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-change"));
    }
    router.push("/login");
  };

  return (
    <aside className="no-scrollbar flex w-full flex-col border-r border-slate-200/80 bg-white lg:sticky lg:top-[66px] lg:h-[calc(100vh-66px)] lg:self-start lg:overflow-y-auto">
      <Link
        href="/account"
        className="mx-3 mb-2 mt-4 hidden flex-col items-center rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 px-3 py-3 text-center transition hover:border-blue-100 hover:bg-blue-50/40 lg:flex"
      >
        <div className="relative h-[52px] w-[52px] overflow-hidden rounded-full bg-slate-100 ring-2 ring-white shadow-sm">
          <AccountAvatar source={user?.avatar_url} name={displayName} sizes="52px" />
        </div>
        <span className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-xs font-bold text-slate-900">
          <span className="truncate">{displayName}</span>
          <Crown className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" />
        </span>
        <span className="mt-0.5 text-[11px] font-medium text-slate-500">
          {membership?.tier?.name ? `Thành viên ${membership.tier.name}` : "Thành viên"}
        </span>
      </Link>

      <nav className="px-3 py-3 lg:px-4 lg:pb-0">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1.5 lg:overflow-visible lg:pb-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              pathname === item.href ||
              (item.href !== "/account" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.id}
                href={item.href}
                prefetch={true}
                onClick={() => setActiveTab?.(item.id)}
                className={`group flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-3 text-left text-sm transition-all lg:w-full lg:gap-3.5 lg:px-4 lg:py-3.5 ${
                  isActive
                    ? "bg-[#eef6ff] font-semibold text-[#1766c2]"
                    : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={1.9}
                  className={isActive ? "text-[#1766c2]" : "text-slate-500"}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                )}
                <NavigationPending />
              </Link>
            );
          })}
        </div>

        {canAccessAdmin && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <Link
              href="/admin"
              className="flex w-full items-center gap-3.5 rounded-xl bg-blue-50 px-4 py-3.5 text-sm font-semibold text-[#1766c2] transition-colors hover:bg-blue-100"
            >
              <LayoutDashboard size={20} strokeWidth={1.9} />
              <span>Trang quản trị</span>
              <NavigationPending />
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-medium text-rose-500 transition hover:bg-rose-50"
        >
          <LogOut size={20} strokeWidth={1.9} />
          <span>Đăng xuất</span>
        </button>
      </nav>

      <div className="mt-auto hidden overflow-hidden pt-4 lg:block">
        <div className="relative h-[180px] bg-gradient-to-b from-white via-[#edf8ff] to-[#c9ebff]">
          <div className="absolute left-6 top-2 -rotate-6 select-none text-[26px] font-semibold italic leading-[1.05] text-[#0f4d88] [font-family:cursive]">
            Good
            <br />
            Vibes
            <br />
            Only
          </div>
          <div className="absolute left-[110px] top-[48px] text-2xl text-[#1766c2]">
            ⌁✈
          </div>
          <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(160deg,transparent_0_32%,#8dc7ed_33%_52%,#65acd8_53%_70%,#3b90c7_71%_100%)] opacity-90" />
          <div className="absolute inset-x-0 bottom-0 h-[50px] bg-gradient-to-b from-[#5fc3ea]/20 to-[#4aa8d3]/80" />
        </div>
      </div>
    </aside>
  );
}
