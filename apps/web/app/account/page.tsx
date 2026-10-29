"use client";

import { AccountContent } from "@/components/account/layout/AccountContent";

import { AccountOverviewTab } from "@/components/account/profile/AccountOverviewTab";
import { useAccount } from "@/components/account/layout/AccountShell";
import { getAccountStats, getMyBookings } from "@/lib/account/api";
import { useAccountResource } from "@/lib/account/useAccountResource";
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
