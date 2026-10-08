import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BlogPromoBanner() {
  return (
    <div className="relative min-h-[220px] w-full overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-md">
      <Image
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600"
        alt="Khám phá thế giới cùng TravelGo"
        fill
        className="object-cover opacity-75"
        sizes="360px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-sky-900/90 via-sky-800/40 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-between space-y-4 pt-2">
        <div className="space-y-1.5">
          <h3 className="text-xl font-black leading-tight text-white sm:text-2xl">
            Khám phá thế giới cùng TravelGo
          </h3>
          <p className="text-xs font-medium text-white/90 sm:text-sm">
            Những hành trình tuyệt vời đang chờ bạn!
          </p>
        </div>

        <div>
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-extrabold text-sky-700 shadow-md transition hover:bg-sky-50 active:scale-95"
          >
            <span>Xem các tour</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
