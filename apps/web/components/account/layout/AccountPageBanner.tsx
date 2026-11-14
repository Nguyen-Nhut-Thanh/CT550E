"use client";

import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function AccountPageBanner({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-slate-100 bg-sky-100 shadow-sm sm:rounded-3xl">
      <Image
        src="/images/about/travel-dreams-banner.png"
        alt=""
        fill
        priority
        className="object-cover object-[center_35%]"
        sizes="(max-width: 1024px) 100vw, 1240px"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/65 to-white/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/45 via-transparent to-white/10" />
      <div className="relative z-10 flex min-h-[180px] flex-col justify-between gap-5 p-4 sm:min-h-[185px] sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100/90 text-[#1766c2] shadow-sm sm:h-14 sm:w-14">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-700 sm:text-sm">{description}</p>
          </div>
          <p className="ml-auto hidden max-w-[190px] rotate-[-4deg] text-right font-serif text-sm font-bold italic leading-tight text-sky-900 md:block">Khám phá thêm<br />những chuyến đi tuyệt vời!</p>
        </div>
        {children ? <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">{children}</div> : null}
      </div>
    </section>
  );
}
