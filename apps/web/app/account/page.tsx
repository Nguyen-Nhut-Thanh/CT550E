"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { fetchMe, getToken } from "@/lib/client/utils/auth";
import {
  getAccountStats,
  getMyBookings,
  getMyFavoriteTours,
} from "@/lib/client/api/authApi";
import { AccountOverviewTab, AccountSidebar } from "@/components/account";
import type {
  AccountBooking,
  AccountStats,
  FavoriteTourItem,
  UserProfile,
} from "shared";

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<AccountStats | null>(null);
  const [bookings, setBookings] = useState<AccountBooking[]>([]);
  const [favorites, setFavorites] = useState<FavoriteTourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const navigateToTab = useCallback((tab: string) => {
    const routes: Record<string, string> = {
      overview: "/account",
      bookings: "/account/bookings",
      favorites: "/account/favorites",
      reviews: "/account/reviews",
      photos: "/account/reviews",
      wallet: "/account/wallet",
      notifications: "/account/notifications",
      settings: "/account/settings",
      destinations: "/tours",
    };
    const route = routes[tab];
    if (route) router.push(route);
  }, [router]);

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
      <AccountSidebar activeTab="overview" user={user} />
      <main className="min-w-0">
        <AccountOverviewTab
          user={user}
          stats={stats}
          bookings={bookings}
          favorites={favorites}
          loading={loading}
          setActiveTab={navigateToTab}
        />
      </main>
    </div>
  );
}

