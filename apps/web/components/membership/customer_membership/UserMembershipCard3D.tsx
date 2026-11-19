"use client";

import { useMemo, useRef, useState, type MouseEvent } from "react";
import { Compass, Sparkles, Wifi } from "lucide-react";
import type { MembershipTierId } from "shared";

interface CardTierVisual {
  id: MembershipTierId;
  name: string;
  badge: string;
  multiplier: string;
  gradient: string;
  shadow: string;
  accentText: string;
}

const CARD_TIER_CONFIGS: Record<MembershipTierId, CardTierVisual> = {
  bronze: {
    id: "bronze",
    name: "MEMBER BRONZE",
    badge: "Hạng Đồng",
    multiplier: "1.0× Điểm",
    gradient: "linear-gradient(135deg, #2D1B10 0%, #6E3D1A 48%, #A05A2C 100%)",
    shadow: "0 25px 50px -12px rgba(160, 90, 44, 0.35)",
    accentText: "text-amber-200",
  },
  silver: {
    id: "silver",
    name: "EXPLORER SILVER",
    badge: "Hạng Bạc",
    multiplier: "1.2× Điểm",
    gradient: "linear-gradient(135deg, #1E293B 0%, #475569 50%, #94A3B8 100%)",
    shadow: "0 25px 50px -12px rgba(148, 163, 184, 0.3)",
    accentText: "text-slate-200",
  },
  gold: {
    id: "gold",
    name: "VOYAGER GOLD",
    badge: "Hạng Vàng",
    multiplier: "1.5× Điểm",
    gradient: "linear-gradient(135deg, #2A2112 0%, #8A6421 48%, #D4AF37 100%)",
    shadow: "0 25px 50px -12px rgba(212, 175, 55, 0.35)",
    accentText: "text-amber-300",
  },
  platinum: {
    id: "platinum",
    name: "ELITE PLATINUM",
    badge: "Hạng Bạch Kim",
    multiplier: "2.0× Điểm",
    gradient: "linear-gradient(135deg, #082F49 0%, #0E7490 50%, #38BDF8 100%)",
    shadow: "0 25px 50px -12px rgba(56, 189, 248, 0.35)",
    accentText: "text-cyan-300",
  },
  diamond: {
    id: "diamond",
    name: "SIGNATURE DIAMOND",
    badge: "Hạng Kim Cương",
    multiplier: "3.0× Điểm",
    gradient: "linear-gradient(135deg, #022C22 0%, #065F46 45%, #10B981 100%)",
    shadow: "0 25px 50px -12px rgba(16, 185, 129, 0.35)",
    accentText: "text-emerald-300",
  },
};

const ALL_TIER_KEYS: MembershipTierId[] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
];

interface UserMembershipCard3DProps {
  currentTierId: MembershipTierId;
  memberName?: string | null;
  memberId?: string | number | null;
  cycleEnd?: string | null;
  activePreviewTier?: MembershipTierId;
  onSelectPreviewTier?: (tier: MembershipTierId) => void;
}

export function UserMembershipCard3D({
  currentTierId,
  memberName,
  memberId,
  cycleEnd,
  activePreviewTier,
  onSelectPreviewTier,
}: UserMembershipCard3DProps) {
  const [internalPreviewTier, setInternalPreviewTier] =
    useState<MembershipTierId>(currentTierId);

  const selectedTier = activePreviewTier ?? internalPreviewTier;
  const config = CARD_TIER_CONFIGS[selectedTier] ?? CARD_TIER_CONFIGS.bronze;
  const isActualTier = selectedTier === currentTierId;

  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>(
    "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
  );
  const [shineStyle, setShineStyle] = useState<string>(
    "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.25) 0%, transparent 65%)",
  );

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -11;
    const rotateY = ((x - centerX) / centerX) * 11;

    setTransformStyle(
      `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
    );
    setShineStyle(
      `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255,255,255,0.36) 0%, transparent 60%)`,
    );
  };

  const handleMouseLeave = () => {
    setTransformStyle("rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setShineStyle(
      "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.25) 0%, transparent 65%)",
    );
  };

  const formattedId = useMemo(() => {
    const raw = String(memberId || "8849").padStart(6, "0");
    return `ID: ${raw.slice(0, 4)} • 2026 • ${raw.slice(-4)}`;
  }, [memberId]);

  const formattedExpiry = useMemo(() => {
    if (!cycleEnd) return "Vô thời hạn";
    try {
      const d = new Date(cycleEnd);
      return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return "12/2028";
    }
  }, [cycleEnd]);

  const handleTierClick = (tierId: MembershipTierId) => {
    setInternalPreviewTier(tierId);
    onSelectPreviewTier?.(tierId);
  };

  return (
    <div className="flex w-full flex-col items-center">
      {/* 3D Perspective Container */}
      <div
        className="w-full max-w-[460px]"
        style={{ perspective: "1200px" }}
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative aspect-[1.586/1] w-full cursor-grab select-none overflow-hidden rounded-3xl border border-white/20 p-6 sm:p-7 shadow-2xl transition-[box-shadow,background] duration-500 active:cursor-grabbing"
          style={{
            transformStyle: "preserve-3d",
            transform: transformStyle,
            background: config.gradient,
            boxShadow: config.shadow,
            transition: "transform 0.15s ease-out, background 0.5s ease, box-shadow 0.5s ease",
          }}
        >
          {/* Dynamic Shine Layer */}
          <div
            className="pointer-events-none absolute inset-0 z-0 transition-opacity"
            style={{ background: shineStyle }}
          />

          {/* Luxury Card Mesh Pattern */}
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />

          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-52 w-52 rounded-full bg-white/10 blur-2xl" />

          {/* Card Top Row */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/25 bg-white/15 backdrop-blur-md shadow-sm">
                <Compass className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-serif text-sm font-bold tracking-widest text-white leading-none">
                  JOURNITRIP
                </p>
                <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/75">
                  Privilege Club
                </p>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-block rounded-full border border-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md ${
                  isActualTier
                    ? "bg-amber-400/30 text-amber-100 ring-1 ring-amber-300/40"
                    : "bg-black/35 text-white/90"
                }`}
              >
                {isActualTier ? "★ Hạng Của Bạn" : config.badge}
              </span>
              <h3 className="mt-1 font-serif text-lg sm:text-xl font-bold tracking-wide text-white">
                {config.name}
              </h3>
            </div>
          </div>

          {/* Card Middle Row: Chip & Contactless */}
          <div className="relative z-10 my-auto flex items-center justify-between py-2">
            {/* Realistic EMV Metallic Chip */}
            <div className="flex h-8 w-11 items-center justify-center rounded-md border border-black/25 bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 shadow-inner">
              <div className="grid h-5 w-7 grid-cols-2 rounded-xs border border-black/20">
                <div className="border-b border-r border-black/20" />
                <div className="border-b border-black/20" />
                <div className="border-r border-black/20" />
                <div />
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/70">
              <Wifi className="h-5 w-5 rotate-90" />
            </div>
          </div>

          {/* Card Bottom Row: Member Info */}
          <div className="relative z-10 flex items-end justify-between border-t border-white/15 pt-2 sm:pt-3">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/70">
                Chủ Thẻ Thành Viên
              </p>
              <p className="mt-0.5 truncate text-xs sm:text-sm font-bold uppercase tracking-wider text-white max-w-[200px]">
                {memberName || "QUÝ KHÁCH HỘI VIÊN"}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-white/75">
                {formattedId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-white/70">
                Tích lũy
              </p>
              <p className="text-sm sm:text-base font-extrabold text-white">
                {config.multiplier}
              </p>
              <p className="text-[9px] text-white/75">
                Hiệu lực: {formattedExpiry}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Selector Pills */}
      <div className="mt-5 w-full max-w-[460px]">
        <div className="mb-2 flex items-center justify-between px-1 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Nhấn để xem thử thiết kế các hạng thẻ:
          </span>
          {selectedTier !== currentTierId && (
            <button
              type="button"
              onClick={() => handleTierClick(currentTierId)}
              className="text-[11px] font-semibold text-amber-400 underline hover:text-amber-300"
            >
              Về hạng của tôi
            </button>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5 rounded-2xl border border-white/10 bg-[#0A1424]/90 p-1.5 shadow-md">
          {ALL_TIER_KEYS.map((key) => {
            const isSelected = key === selectedTier;
            const isUserTier = key === currentTierId;
            const tierVisual = CARD_TIER_CONFIGS[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleTierClick(key)}
                className={`group relative rounded-xl px-1.5 py-2 text-center text-[11px] font-semibold transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-[#050B14] shadow-md"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="block truncate">
                  {tierVisual.badge.replace("Hạng ", "")}
                </span>
                {isUserTier && (
                  <span
                    className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${
                      isSelected ? "bg-[#050B14]" : "bg-amber-400"
                    }`}
                    title="Hạng hiện tại của bạn"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
