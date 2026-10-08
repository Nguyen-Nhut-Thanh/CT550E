"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone, User, CalendarDays, Loader2 } from "lucide-react";
import type { UserProfile, FeaturedDestinationItem } from "shared";
import { getFeaturedDestinations } from "@/lib/client/api/featuredDestinations";

interface AccountRightSidebarProps {
  user: UserProfile | null;
  setActiveTab: (tab: string) => void;
}

export function AccountRightSidebar({ user, setActiveTab }: AccountRightSidebarProps) {
  const [destinations, setDestinations] = useState<FeaturedDestinationItem[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDestinations() {
      try {
        const res = await getFeaturedDestinations();
        if (!active) return;
        const allItems = res?.regions?.flatMap((r) => r.items) || [];
        setDestinations(allItems.slice(0, 4));
      } catch {
        if (active) setDestinations([]);
      } finally {
        if (active) setLoadingDestinations(false);
      }
    }

    loadDestinations();

    return () => {
      active = false;
    };
  }, []);

  const displayName = user?.full_name || "Khách hàng";
  const email = user?.accounts?.email || "Chưa cập nhật";
  const phone = user?.phone || "Chưa cập nhật";
  const birthday = user?.birthday || "Chưa cập nhật";
  const gender = user?.gender === "female" ? "Nữ" : user?.gender === "male" ? "Nam" : "Chưa cập nhật";

  const infoItems = [
    { label: "Họ và tên", value: displayName, icon: User },
    { label: "Email", value: email, icon: Mail },
    { label: "Số điện thoại", value: phone, icon: Phone },
    { label: "Ngày sinh", value: birthday, icon: CalendarDays },
    { label: "Giới tính", value: gender, icon: User },
  ];

  return (
    <div className="space-y-3.5">
      <section className="relative h-[156px] overflow-hidden rounded-[13px] border border-sky-100 bg-[#dff5ff]">
        <Image
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=700"
          alt="Travel quote"
          fill
          className="object-cover opacity-45"
          sizes="360px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#d9f2ff]/95 via-[#d9f2ff]/78 to-transparent" />
        <div className="absolute left-5 top-6 max-w-[245px] text-[16px] font-semibold italic leading-[1.5] text-[#28577c] [font-family:cursive]">
          “Không phải là đích đến,<br />mà là những trải nghiệm<br />trên đường đi mới thật sự<br />có giá trị.”
        </div>
        <div className="absolute bottom-5 right-14 rotate-12 text-2xl text-[#1766c2]">✈</div>
      </section>

      <section className="rounded-[13px] border border-slate-100 bg-white p-4 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 fill-[#1766c2]/10 text-[#1766c2]" />
          <h3 className="text-[15px] font-bold text-slate-900">Thông tin cá nhân</h3>
        </div>

        <div className="space-y-3.5">
          {infoItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="grid grid-cols-[116px_minmax(0,1fr)] items-center gap-2 text-[11px]">
                <div className="flex items-center gap-2 text-slate-400">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </div>
                <span className="truncate text-right font-semibold text-slate-700" title={String(item.value)}>
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className="mt-5 w-full rounded-lg bg-[#eef6ff] py-2.5 text-[12px] font-semibold text-[#1766c2] transition hover:bg-blue-100"
        >
          Chỉnh sửa thông tin
        </button>
      </section>

      <section className="rounded-[13px] border border-slate-100 bg-white p-4 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#1766c2]" />
            <h3 className="text-[14px] font-bold text-slate-800">Điểm đến nổi bật</h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("favorites")}
            className="text-[10px] font-semibold text-[#1766c2]"
          >
            Xem tất cả →
          </button>
        </div>

        {loadingDestinations ? (
          <div className="flex h-20 items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
          </div>
        ) : destinations.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-500">
            Chưa có điểm đến nổi bật.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {destinations.map((dest) => (
              <Link
                key={dest.location_id}
                href={`/tours?destination=${encodeURIComponent(dest.name)}`}
                className="group relative h-[116px] overflow-hidden rounded-[10px] bg-slate-100"
              >
                {dest.image_url ? (
                  <Image
                    src={dest.image_url}
                    alt={dest.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="180px"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <span className="absolute bottom-2.5 left-3 text-[12px] font-bold text-white drop-shadow-sm">
                  {dest.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

