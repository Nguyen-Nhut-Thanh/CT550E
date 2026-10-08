"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Settings } from "lucide-react";
import { fetchMe, getToken } from "@/lib/client/utils/auth";
import {
  getAccountStats,
  getMyBookings,
  getMyFavoriteTours,
} from "@/lib/client/api/authApi";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { AccountProfileHeader } from "@/components/account/AccountProfileHeader";
import { AccountOverview } from "@/components/account/AccountOverview";
import { AccountRightSidebar } from "@/components/account/AccountRightSidebar";
import type {
  AccountBooking,
  AccountStats,
  FavoriteTourItem,
  UserProfile,
} from "shared";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<AccountStats | null>(null);
  const [bookings, setBookings] = useState<AccountBooking[]>([]);
  const [favorites, setFavorites] = useState<FavoriteTourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const initData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const userData = await fetchMe();
      if (!userData) {
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      setUser(userData as UserProfile);

      const [statsData, bookingsData, favoritesData] = await Promise.allSettled([
        getAccountStats(),
        getMyBookings(),
        getMyFavoriteTours(),
      ]);

      if (statsData.status === "fulfilled") setStats(statsData.value);
      if (bookingsData.status === "fulfilled") setBookings(bookingsData.value);
      if (favoritesData.status === "fulfilled") setFavorites(favoritesData.value);
    } catch {
      setError("Không thể tải thông tin tài khoản. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    initData();
  }, [initData]);

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb]">
        <div className="rounded-2xl border border-slate-100 bg-white px-10 py-12 text-center shadow-sm">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-600">Đang tải trang cá nhân của bạn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-14 w-14 text-rose-500" />
          <h2 className="mb-2 text-xl font-bold text-slate-900">Đã có lỗi xảy ra</h2>
          <p className="mb-6 text-sm text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Thử lại ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:grid lg:grid-cols-[268px_minmax(0,1fr)]">
      <AccountSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      <main className="min-w-0">
        <section className="relative h-[138px] overflow-hidden bg-sky-400 lg:h-[138px]">
          <Image
            src="https://images.unsplash.com/photo-1528127269322-539801943592?q=85&w=1800"
            alt="JourniTrip cover"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) calc(100vw - 268px), 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5" />

          <div className="absolute left-[9%] top-5 select-none text-center text-white drop-shadow-md">
            <p className="-rotate-3 text-[27px] font-semibold italic leading-[1.05] [font-family:cursive]">
              Collect moments<br />not things
            </p>
            <div className="ml-40 mt-0 text-2xl">⌁✈</div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-[#235f97]/95 px-4 py-2 text-[12px] font-semibold text-white shadow-sm backdrop-blur-sm transition hover:bg-[#174f83]"
          >
            <Settings className="h-4 w-4" />
            Cài đặt
          </button>
        </section>

        <div className="grid grid-cols-1 gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-5 lg:px-8 lg:pb-8 lg:pt-0">
          <div className="min-w-0">
            <AccountProfileHeader user={user} />
            <AccountOverview
              user={user}
              stats={stats}
              bookings={bookings}
              favorites={favorites}
              loading={loading}
              setActiveTab={setActiveTab}
            />
          </div>

          <div className="pt-4 lg:pt-[18px]">
            <AccountRightSidebar user={user} setActiveTab={setActiveTab} />
          </div>
        </div>
      </main>
    </div>
  );
}
