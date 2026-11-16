"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  Flower,
  Leaf,
  Loader2,
  Save,
  Sliders,
  Snowflake,
  Sparkles,
  Sun,
  XCircle,
} from "lucide-react";
import type { SeasonalThemeConfig, SeasonMode, SeasonType } from "shared";
import {
  fetchAdminSeasonalTheme,
  saveAdminSeasonalTheme,
} from "@/lib/banners/admin/api";
import { useToast } from "@/lib/notifications/useToast";
import { SeasonalParticles } from "@/components/banners/seasonal_theme/UserSeasonalParticles";
import { SEASONS_DATA } from "@/lib/banners/client/seasonalConstants";

const SEASON_OPTIONS: {
  id: SeasonMode;
  name: string;
  icon: typeof Flower;
  desc: string;
  activeSeasonEquivalent: SeasonType;
}[] = [
  {
    id: "spring",
    name: "Mùa Xuân",
    icon: Flower,
    desc: "Cánh hoa anh đào phớt hồng rơi xoay nhẹ nhàng",
    activeSeasonEquivalent: "spring",
  },
  {
    id: "summer",
    name: "Mùa Hè",
    icon: Sun,
    desc: "Đốm đom đóm & nắng hạ vàng biển biếc bay lơ lửng",
    activeSeasonEquivalent: "summer",
  },
  {
    id: "autumn",
    name: "Mùa Thu",
    icon: Leaf,
    desc: "Những chiếc lá phong vàng hổ phách chao nghiêng",
    activeSeasonEquivalent: "autumn",
  },
  {
    id: "winter",
    name: "Mùa Đông",
    icon: Snowflake,
    desc: "Những bông tuyết trắng muốt rơi phủ sương băng giá",
    activeSeasonEquivalent: "winter",
  },
  {
    id: "auto",
    name: "Tự động theo tháng",
    icon: Calendar,
    desc: "Tự động đổi theo lịch thực tế (T3-5: Xuân, T6-8: Hè, T9-11: Thu, T12-2: Đông)",
    activeSeasonEquivalent: (() => {
      const month = new Date().getMonth() + 1;
      if (month >= 3 && month <= 5) return "spring";
      if (month >= 6 && month <= 8) return "summer";
      if (month >= 9 && month <= 11) return "autumn";
      return "winter";
    })(),
  },
  {
    id: "disabled",
    name: "Tắt hiệu ứng",
    icon: XCircle,
    desc: "Giữ giao diện trang chủ ở trạng thái tĩnh mặc định",
    activeSeasonEquivalent: "spring",
  },
];

export function SeasonalThemeManager() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<SeasonMode>("auto");
  const [enableParticles, setEnableParticles] = useState(true);
  const [enableColors, setEnableColors] = useState(true);
  const [density, setDensity] = useState<"light" | "normal" | "dense">(
    "normal",
  );

  // Preview season tracking
  const [previewSeason, setPreviewSeason] = useState<SeasonType>("spring");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAdminSeasonalTheme()
      .then((data) => {
        if (!active) return;
        setMode(data.mode);
        setEnableParticles(data.enableParticles);
        setEnableColors(data.enableColors);
        setDensity(data.particleDensity);
        setPreviewSeason(data.activeSeason || "spring");
      })
      .catch((err) => {
        if (!active) return;
        toast.error(
          err instanceof Error
            ? err.message
            : "Không tải được cấu hình hiệu ứng 4 mùa",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSelectMode = (selectedMode: SeasonMode) => {
    setMode(selectedMode);
    const found = SEASON_OPTIONS.find((s) => s.id === selectedMode);
    if (found && selectedMode !== "disabled") {
      setPreviewSeason(found.activeSeasonEquivalent);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAdminSeasonalTheme({
        mode,
        enableParticles,
        enableColors,
        particleDensity: density,
      });
      toast.success("Đã lưu cấu hình hiệu ứng 4 mùa thành công!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể lưu cấu hình",
      );
    } finally {
      setSaving(false);
    }
  };

  const currentSeasonData = SEASONS_DATA[previewSeason];

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-100 bg-white p-8">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span>Đang tải cấu hình hiệu ứng 4 mùa...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Save Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 p-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Giao diện &amp; Hiệu ứng 4 Mùa Trang Chủ
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Tùy chỉnh hiệu ứng hạt Canvas (hoa đào, đom đóm, lá vàng, tuyết
              rơi) và màu sắc theo mùa cho toàn bộ trang chủ.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>{saving ? "Đang lưu..." : "Lưu cấu hình"}</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Left Column: Mode & Options */}
        <div className="space-y-6">
          {/* Season Cards Grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3.5 flex items-center gap-2">
              <Sliders size={16} className="text-blue-600" />
              Chọn chế độ hiển thị mùa
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {SEASON_OPTIONS.map((opt) => {
                const isSelected = mode === opt.id;
                const IconComponent = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectMode(opt.id)}
                    className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <IconComponent size={18} />
                      </div>
                      {isSelected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>

                    <span className="font-bold text-sm text-slate-900 mb-1">
                      {opt.name}
                    </span>
                    <span className="text-xs text-slate-500 leading-relaxed">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Options: Toggles & Density */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Tùy chọn hiển thị chi tiết
            </h3>

            <div className="space-y-3">
              {/* Toggle Particles */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableParticles && mode !== "disabled"}
                  disabled={mode === "disabled"}
                  onChange={(e) => setEnableParticles(e.target.checked)}
                  className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Bật hiệu ứng hạt bay toàn trang chủ (Falling Particles)
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hiển thị cánh hoa đào, đom đóm, lá phong hoặc bông tuyết rơi
                    lơ lửng khắp trang chủ.
                  </p>
                </div>
              </label>

              {/* Toggle Colors */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableColors && mode !== "disabled"}
                  disabled={mode === "disabled"}
                  onChange={(e) => setEnableColors(e.target.checked)}
                  className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Bật dải màu nền 4 mùa cho các section (Seasonal Background
                    Palette)
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tự động đồng bộ tông màu nền dịu mắt và vệt sáng cho các
                    phần Về chúng tôi, Flash Deals, Tour nổi bật...
                  </p>
                </div>
              </label>
            </div>

            {/* Particle Density */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mật độ hạt hiệu ứng
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: "light", label: "Nhẹ nhàng" },
                  { value: "normal", label: "Tiêu chuẩn" },
                  { value: "dense", label: "Dày đặc" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    disabled={mode === "disabled" || !enableParticles}
                    onClick={() => setDensity(item.value as any)}
                    className={`rounded-xl border py-2 text-xs font-semibold transition ${
                      density === item.value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    } disabled:opacity-50`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview Card */}
        <div>
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Khung xem trước trực tiếp (Live Preview)
              </h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 uppercase">
                {currentSeasonData.name}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {mode === "disabled"
                ? "Hiệu ứng đang tắt."
                : currentSeasonData.description}
            </p>

            {/* Preview Box with simulated Hero Banner & Particles */}
            <div
              className={`relative h-[340px] w-full overflow-hidden rounded-2xl border border-slate-200 transition-colors duration-700 shadow-inner flex flex-col justify-between p-5 ${
                enableColors && mode !== "disabled"
                  ? currentSeasonData.theme.bgPage
                  : "bg-slate-900"
              }`}
            >
              {/* Particle Canvas running in container mode */}
              {enableParticles && mode !== "disabled" && (
                <SeasonalParticles
                  season={previewSeason}
                  density={density}
                  fixed={false}
                />
              )}

              {/* Decorative mini header */}
              <div className="relative z-10 flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Journitrip Preview
                </span>
                <span className="rounded-md bg-white/70 px-2 py-0.5 text-[10px] text-slate-600 backdrop-blur-xs">
                  {currentSeasonData.englishName}
                </span>
              </div>

              {/* Mini Hero card mockup */}
              <div className="relative z-10 rounded-xl bg-white/80 p-4 backdrop-blur-md border border-white/60 shadow-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${currentSeasonData.theme.badgeBg} ${currentSeasonData.theme.badgeText}`}
                  >
                    Khám phá {currentSeasonData.name}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                  Hành trình du lịch &amp; Ưu đãi đặc quyền
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  Trải nghiệm những điểm đến rực rỡ nhất trong mùa cùng
                  Journitrip.
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-blue-600">Từ 2.890.000đ</span>
                  <span className="rounded-lg bg-blue-600 px-3 py-1 font-bold text-white text-[10px]">
                    Đặt ngay
                  </span>
                </div>
              </div>

              <div className="relative z-10 text-[10px] text-slate-400 text-center">
                Hiệu ứng chuyển động mô phỏng thực tế 60 FPS
              </div>
            </div>

            <div className="rounded-xl bg-sky-50/70 p-3 text-xs leading-relaxed text-sky-800">
              💡 <strong>Mẹo:</strong> Sau khi nhấp chọn mùa mong muốn, hãy bấm
              nút <strong>Lưu cấu hình</strong> ở phía trên để cập nhật ra trang
              chủ website.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
