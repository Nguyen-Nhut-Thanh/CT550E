"use client";

import Image from "next/image";
import { Settings } from "lucide-react";
import { AccountProfileHeader } from "./AccountProfileHeader";
import { AccountOverview } from "./AccountOverview";
import { AccountRightSidebar } from "../sidebar/AccountRightSidebar";
import type { AccountOverviewTabProps } from "shared";

export function AccountOverviewTab({
  user,
  stats,
  bookings,
  favorites,
  loading,
  setActiveTab = () => {},
}: AccountOverviewTabProps) {
  return (
    <>
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
    </>
  );
}
