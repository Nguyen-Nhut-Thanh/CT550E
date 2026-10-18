"use client";

import { AccountContent } from "@/components/account/AccountContent";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccountResource } from "@/components/account/useAccountResource";
import { useAccount } from "@/components/account/AccountShell";
import {
  getAccountStats,
  getMyBookings,
  getMyFavoriteTours,
} from "@/lib/client/api/authApi";
import { AccountOverviewTab } from "@/components/account";
import type {
  AccountBooking,
  AccountStats,
  FavoriteTourItem,
} from "shared";

export default function AccountPage() {
  const { user } = useAccount();
  const { data: stats = null, loading: statsLoading } = useAccountResource("stats", getAccountStats);
  const { data: bookings = [], loading: bookingsLoading } = useAccountResource("bookings", getMyBookings);
  const { data: favorites = [], loading: favoritesLoading } = useAccountResource("favorites", getMyFavoriteTours);
  const loading = statsLoading || bookingsLoading || favoritesLoading;
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

  return (
    <div>
      <AccountContent>
        <AccountOverviewTab
          user={user}
          stats={stats}
          bookings={bookings}
          favorites={favorites}
          loading={loading}
          setActiveTab={navigateToTab}
        />
      </AccountContent>
    </div>
  );
}

