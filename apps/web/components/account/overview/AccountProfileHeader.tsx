"use client";

import Image from "next/image";
import { BadgeCheck, Camera, MapPin, UserRound } from "lucide-react";
import type { AccountProfileHeaderProps } from "shared";

export function AccountProfileHeader({ user }: AccountProfileHeaderProps) {
  const displayName = user?.full_name || "Nguyễn Nhựt Thanh";
  const email = user?.accounts?.email || "nguyennhutthanh25.2005@gmail.com";
  const bio = user?.bio || '"Đi nhiều hơn, trải nghiệm nhiều hơn" ⛰️';
  const nationality = user?.nationality || "Việt Nam";

  return (
    <section className="relative flex min-h-[138px] items-start pl-[168px] pr-3 pt-4 sm:pl-[180px]">
      <div className="absolute -top-[46px] left-5 z-10 sm:left-8">
        <div className="relative h-[138px] w-[138px] overflow-hidden rounded-full border-[5px] border-white bg-slate-100 shadow-sm">
          <Image
            src={
              user?.avatar_url ||
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=400"
            }
            alt={displayName}
            fill
            className="object-cover"
            sizes="138px"
          />
        </div>
        <button
          type="button"
          aria-label="Đổi ảnh đại diện"
          className="absolute bottom-1 right-0 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-[#1766c2] text-white shadow-md transition hover:bg-blue-700"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      <div className="min-w-0 pt-1">
        <div className="flex items-center gap-1.5">
          <h1 className="truncate text-[23px] font-extrabold tracking-[-0.025em] text-slate-950">
            {displayName}
          </h1>
          <BadgeCheck className="h-5 w-5 fill-[#1766c2] text-white" />
        </div>

        <p className="mt-1 truncate text-[13px] font-medium text-slate-500">{email}</p>
        <p className="mt-2 text-[13px] font-medium italic text-slate-500">{bio}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5" />
            Khách hàng
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {nationality}
          </span>
        </div>
      </div>
    </section>
  );
}
