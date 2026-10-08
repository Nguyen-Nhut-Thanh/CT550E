"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Heart,
  LogOut,
  Settings,
  Star,
  User,
  Wallet,
} from "lucide-react";
import { removeToken } from "@/lib/client/utils/auth";
import type { UserProfile } from "shared";

interface AccountSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile | null;
}

const menuItems = [
  { id: "overview", label: "Trang cá nhân", icon: User },
  { id: "favorites", label: "Tour yêu thích", icon: Heart },
  { id: "bookings", label: "Lịch sử đặt tour", icon: CalendarDays },
  { id: "reviews", label: "Bài đánh giá", icon: Star },
  { id: "wallet", label: "Ví & thanh toán", icon: Wallet },
  { id: "notifications", label: "Thông báo", icon: Bell, badge: true },
  { id: "settings", label: "Cài đặt", icon: Settings },
];

export function AccountSidebar({ activeTab, setActiveTab }: AccountSidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-change"));
    }
    router.push("/login");
  };

  return (
    <aside className="flex min-h-screen w-full flex-col border-r border-slate-200/80 bg-white lg:h-screen lg:sticky lg:top-0">
      <div className="px-7 pt-7 pb-5">
        <Link href="/" className="block">
          <div className="text-[28px] font-black tracking-[-0.04em] text-[#1766c2] leading-none">
            <span className="relative inline-block pr-1">
              JourniTrip
              <span className="absolute -right-1 bottom-0.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-slate-400">
            Khám phá thế giới cùng bạn
          </p>
        </Link>
      </div>

      <nav className="px-4 pt-3">
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`group flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-left text-sm transition-all ${
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
                {item.badge && <span className="h-2 w-2 rounded-full bg-rose-500" />}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-medium text-rose-500 transition hover:bg-rose-50"
        >
          <LogOut size={20} strokeWidth={1.9} />
          <span>Đăng xuất</span>
        </button>
      </nav>

      <div className="mt-auto overflow-hidden pt-10">
        <div className="relative h-[265px] bg-gradient-to-b from-white via-[#edf8ff] to-[#c9ebff]">
          <div className="absolute left-7 top-2 -rotate-6 select-none text-[32px] font-semibold italic leading-[1.05] text-[#0f4d88] [font-family:cursive]">
            Good<br />Vibes<br />Only
          </div>
          <div className="absolute left-[120px] top-[65px] text-3xl text-[#1766c2]">⌁✈</div>
          <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(160deg,transparent_0_32%,#8dc7ed_33%_52%,#65acd8_53%_70%,#3b90c7_71%_100%)] opacity-90" />
          <div className="absolute inset-x-0 bottom-0 h-[72px] bg-gradient-to-b from-[#5fc3ea]/20 to-[#4aa8d3]/80" />
        </div>
      </div>
    </aside>
  );
}
