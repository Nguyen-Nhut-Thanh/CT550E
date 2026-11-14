"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Gift, Sparkles, Ticket } from "lucide-react";
import Link from "next/link";
import { HomeVoucherCard } from "./HomeVoucherCard";
import { HomeVoucherDetailModal } from "./HomeVoucherDetailModal";
import type { PublicHomeVouchersData, Voucher } from "shared";

export function HomeVoucherSection({ initialData }: { initialData?: PublicHomeVouchersData }) {
  const [data] = useState<PublicHomeVouchersData | undefined>(initialData);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const config = data?.config;
  const vouchers = data?.vouchers || [];

  const updateScrollState = () => {
    const el = sliderRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 4);
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    updateScrollState();
    const handleScroll = () => updateScrollState();
    const handleResize = () => updateScrollState();
    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [vouchers.length]);

  const scrollSlider = (direction: "left" | "right") => {
    const el = sliderRef.current;
    if (!el) return;
    const scrollAmount = Math.max(320, el.clientWidth * 0.75);
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // If campaign is disabled by admin or no vouchers to show, don't render the section
  if (!config?.enabled || vouchers.length === 0) {
    return null;
  }

  return (
    <section
      data-seasonal-voucher="true"
      className="relative px-4 py-8 sm:px-6 lg:px-20 transition-colors duration-700 bg-gradient-to-b from-blue-50/40 via-sky-50/30 to-transparent"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Header Bar */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="space-y-2">
            {config.badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-black tracking-wide text-blue-700 uppercase">
                <Gift size={13} className="text-amber-500" />
                {config.badge}
              </span>
            )}
            <div className="relative inline-block">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0f5cab]">
                {config.title || "SĂN VOUCHER ƯU ĐÃI"}
              </h2>
              <span className="absolute -bottom-2 left-0 h-[4px] w-full rounded-full bg-[#0f5cab]" />
            </div>
            <p className="max-w-2xl text-sm sm:text-base font-medium text-slate-600 pt-1">
              {config.subtitle || "Nhận ngay các mã giảm giá hấp dẫn dành riêng cho chuyến du lịch của bạn!"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Ticket size={14} className="text-blue-600" />
              <span>Ví voucher của tôi</span>
            </Link>

            {vouchers.length > 2 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollSlider("left")}
                  disabled={!canScrollLeft}
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 transition ${
                    canScrollLeft
                      ? "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      : "cursor-not-allowed opacity-30 text-slate-300"
                  }`}
                  aria-label="Cuộn sang trái"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider("right")}
                  disabled={!canScrollRight}
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 transition ${
                    canScrollRight
                      ? "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      : "cursor-not-allowed opacity-30 text-slate-300"
                  }`}
                  aria-label="Cuộn sang phải"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Vouchers Slider */}
        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-3 pt-1"
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {vouchers.map((voucher) => (
            <HomeVoucherCard
              key={voucher.voucher_id}
              voucher={voucher}
              onOpenDetail={(v) => setSelectedVoucher(v)}
            />
          ))}
        </div>

        {/* Voucher Detail Modal Popup */}
        {selectedVoucher && (
          <HomeVoucherDetailModal
            voucher={selectedVoucher}
            onClose={() => setSelectedVoucher(null)}
          />
        )}
      </div>
    </section>
  );
}

