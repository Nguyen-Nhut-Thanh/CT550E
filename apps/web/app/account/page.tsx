"use client";

import { AccountContent } from "@/components/users/account_layout/UserAccountContent";

import { AccountOverviewTab } from "@/components/users/account_tabs/UserAccountOverviewTab";
import { useAccount } from "@/components/users/account_layout/UserAccountShell";
import { getAccountStats, getMyBookings } from "@/lib/users/account/api";
import { useAccountResource } from "@/lib/users/account/useAccountResource";
import { getMyFavoriteTours } from "@/lib/favorites/api";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function AccountPage() {
  const { user } = useAccount();
  const { data: stats = null, loading: statsLoading } = useAccountResource(
    "stats",
    getAccountStats,
  );
  const { data: bookings = [], loading: bookingsLoading } = useAccountResource(
    "bookings",
    getMyBookings,
  );
  const { data: favorites = [], loading: favoritesLoading } =
    useAccountResource("favorites", getMyFavoriteTours);
  const loading = statsLoading || bookingsLoading || favoritesLoading;
  const router = useRouter();
  const navigateToTab = useCallback(
    (tab: string) => {
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
    },
    [router],
  );

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
