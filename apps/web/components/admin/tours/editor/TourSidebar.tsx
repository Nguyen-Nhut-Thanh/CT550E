"use client";

import { ImageUpload } from "@/components/common/forms/ImageUpload";
import { VndPriceInput } from "@/components/common/forms/VndPriceInput";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coins,
  Image,
  Info,
  Loader2,
  Minus,
  Moon,
  Plane,
  Plus,
  UsersRound,
} from "lucide-react";
import type { TourDetailForm, TourSidebarProps } from "shared";
import {
  getTourNightRange,
  isValidTourDuration,
  MAX_TOUR_IMAGES,
} from "shared";
import { useEffect, useRef } from "react";
import { TourEditorCard } from "./TourEditorCard";

export function TourSidebar<T extends TourDetailForm>({
  tour,
  mode = "edit",
  saving,
  success,
  lockCoreFields = false,
  onSave,
  onTourChange,
}: TourSidebarProps<T>) {
  const controlsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const updateHeight = () =>
      controls.style.setProperty(
        "--tour-controls-height",
        `${controls.getBoundingClientRect().height}px`,
      );
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(controls);
    return () => observer.disconnect();
  }, []);
  const days = Number(tour.duration_days ?? 1);
  const nights = Number(tour.duration_nights ?? 0);
  const nightRange = getTourNightRange(days);
  const durationValid = isValidTourDuration(days, nights);
  const changeDuration = (
    field: "duration_days" | "duration_nights",
    next: number,
  ) =>
    onTourChange((previous) => {
      const nextDays =
        field === "duration_days"
          ? Math.max(1, Math.trunc(next))
          : Number(previous.duration_days ?? 1);
      const range = getTourNightRange(nextDays);
      const nextNights = Math.min(
        range.max,
        Math.max(
          range.min,
          field === "duration_nights"
            ? Math.trunc(next)
            : Number(previous.duration_nights ?? 0),
        ),
      );
      return {
        ...previous,
        duration_days: nextDays,
        duration_nights: nextNights,
      };
    });
  return (
    <aside
      className="flex min-w-0 flex-col gap-[22px] lg:self-stretch"
      aria-label="Hình ảnh, thời lượng và giá tour"
    >
      <TourEditorCard
        id="tour-media"
        title="Hình ảnh quảng bá"
        description="Ảnh đại diện hiển thị cho tour trên website."
        icon={Image}
      >
        <div className="[&>div>div:first-child]:rounded-[15px] [&>div>div:first-child]:border [&>div>div:first-child]:border-[#9ec4ff] [&>div>div:first-child]:bg-[linear-gradient(145deg,#f3f8ff,#fff)] [&>div>div:first-child]:px-3 [&>div>div:first-child]:py-[19px] [&>div>div:first-child_p:first-of-type]:text-[14px] [&>div>div:first-child_p:first-of-type]:text-[#354966] [&>div>div:first-child_p:last-of-type]:text-[12px] [&>div>div:first-child_p:last-of-type]:leading-[1.7]">
          <ImageUpload
            multiple
            maxFiles={MAX_TOUR_IMAGES}
            previewLayout="carousel"
            label="Kéo thả ảnh vào đây hoặc nhấn để chọn"
            value={tour.images || []}
            onChange={(urls) =>
              onTourChange((previous) => ({
                ...previous,
                images: urls as string[],
              }))
            }
          />
        </div>
        <p className="text-[12px] leading-[1.65] text-[#8490a5] mt-3">
          Tối đa {MAX_TOUR_IMAGES} ảnh. Ảnh đầu tiên được dùng làm ảnh bìa.
        </p>
      </TourEditorCard>
      <TourEditorCard
        id="tour-settings"
        title="Thời lượng"
        description="Thời gian của tour."
        icon={Clock3}
      >
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              {
                key: "duration_days",
                label: "Số ngày",
                min: 1,
                icon: CalendarDays,
              },
              { key: "duration_nights", label: "Số đêm", min: 0, icon: Moon },
            ] as const
          ).map((item) => {
            const count = Number(tour[item.key] ?? item.min);
            const Icon = item.icon;
            const minimum =
              item.key === "duration_nights" ? nightRange.min : item.min;
            const maximum =
              item.key === "duration_nights" ? nightRange.max : undefined;
            return (
              <div key={item.key} className="flex min-w-0 flex-col gap-[7px]">
                <label htmlFor={item.key} className="flex items-center gap-[6px] text-[13px] leading-[1.5] font-bold text-[#26324e]">
                  {item.label} <span className="text-[#ed5f6c]">*</span>
                </label>
                <div className="grid grid-cols-[22px_minmax(0,1fr)_22px] items-center gap-1 rounded-[11px] border border-[#dfe6f1] bg-[#f9fbff] px-2 py-[10px]">
                  <button
                    type="button"
                    className="grid size-[21px] shrink-0 place-items-center rounded-full bg-[#eaf0f8] text-[#53627d] hover:bg-[#dceaff] hover:text-[#0868f9] disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={lockCoreFields || count <= minimum}
                    aria-label={"Giảm " + item.label.toLowerCase()}
                    onClick={() => changeDuration(item.key, count - 1)}
                  >
                    <Minus size={12} />
                  </button>
                  <span className="flex min-w-0 items-center justify-center gap-[3px] [&>svg]:shrink-0 [&>svg]:text-[#8090a9]">
                    <Icon size={16} />
                    <input
                      id={item.key}
                      type="number"
                      min={minimum}
                      max={maximum}
                      step={1}
                      disabled={lockCoreFields}
                      value={count}
                      aria-invalid={!durationValid}
                      aria-describedby="tour-duration-help"
                      className="w-10 min-w-0 [appearance:textfield] bg-transparent p-0 text-center text-[14px] font-[650] outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                      onChange={(event) =>
                        changeDuration(item.key, Number(event.target.value))
                      }
                    />
                  </span>
                  <button
                    type="button"
                    className="grid size-[21px] shrink-0 place-items-center rounded-full bg-[#eaf0f8] text-[#53627d] hover:bg-[#dceaff] hover:text-[#0868f9] disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={
                      lockCoreFields ||
                      (maximum !== undefined && count >= maximum)
                    }
                    aria-label={"Tăng " + item.label.toLowerCase()}
                    onClick={() => changeDuration(item.key, count + 1)}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <p
          id="tour-duration-help"
          className={
            durationValid ? "text-[12px] leading-[1.65] text-[#8490a5] mt-3" : "mt-3 text-[12px] leading-[1.6] text-[#d34453]"
          }
          role={durationValid ? undefined : "alert"}
        >
          Số đêm từ {nightRange.min} đến {nightRange.max}, chênh tối đa 1 so với
          số ngày.
        </p>
      </TourEditorCard>
      <div ref={controlsRef} className="flex shrink-0 flex-col gap-[22px] lg:sticky lg:top-[min(16px,calc(100dvh_-_var(--tour-controls-height,600px)_-_16px))] lg:z-[5]">
        <TourEditorCard
          title="Quản lý chốt khách"
          description="Thiết lập thời hạn chốt khách cho tour."
          icon={UsersRound}
        >
          <div className="flex min-w-0 flex-col gap-[7px]">
            <label htmlFor="tour-cut-off" className="flex items-center gap-[6px] text-[13px] leading-[1.5] font-bold text-[#26324e]">
              Chốt trước (giờ) <span className="text-[#ed5f6c]">*</span>
            </label>
            <div className="relative">
              <Clock3 size={17} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#7e8da5]" />
              <input
                id="tour-cut-off"
                type="number"
                min={0}
                step={1}
                className="w-full rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] px-3 py-[11px] text-[14px] leading-[1.5] text-[#233455] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#94a0b4] focus:border-[#79a8f5] focus:bg-white focus:shadow-[0_0_0_3px_#e8f1ff] disabled:cursor-not-allowed disabled:bg-[#f0f3f8] disabled:text-[#8a96aa] read-only:cursor-not-allowed read-only:bg-[#f0f3f8] read-only:text-[#8a96aa] pl-[38px]"
                value={tour.cut_off_hours ?? ""}
                placeholder="24"
                onChange={(event) =>
                  onTourChange((previous) => ({
                    ...previous,
                    cut_off_hours:
                      event.target.value === ""
                        ? undefined
                        : Number(event.target.value),
                  }))
                }
              />
            </div>
          </div>
          <p className="mt-[11px] flex items-start gap-[7px] rounded-[10px] bg-[#edf5ff] p-[10px] text-[12px] leading-[1.6] text-[#7183a0] [&_svg]:mt-px [&_svg]:shrink-0 [&_svg]:text-[#3184f8]">
            <Info size={16} />
            <span>
              Tour tự động ngừng nhận đặt chỗ trước giờ khởi hành theo thời hạn
              này.
            </span>
          </p>
        </TourEditorCard>
        <TourEditorCard
          title="Giá cơ bản"
          description="Giá áp dụng chưa gồm ưu đãi."
          icon={Coins}
        >
          <label htmlFor="tour-base-price" className="sr-only">
            Giá tour (VNĐ)
          </label>
              <VndPriceInput
                id="tour-base-price"
                value={tour.base_price ?? 0}
                onChange={(value) =>
                  onTourChange((previous) => ({
                    ...previous,
                    base_price: Number(value),
                  }))
                }
                placeholder="Ví dụ: 5.000.000"
              />
        </TourEditorCard>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="relative mt-[2px] flex min-h-[54px] w-full items-center justify-center gap-[11px] rounded-[15px] border border-[#1c69f2] bg-[linear-gradient(135deg,#4c92ff,#1258ef_65%,#0646db)] px-10 py-[14px] text-[15px] font-bold text-white shadow-[0_6px_14px_#1a6af328,inset_0_1px_0_#ffffff50] transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_9px_18px_#1a6af33a] disabled:cursor-wait disabled:opacity-[.65]"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={21} />
          ) : success ? (
            <CheckCircle2 size={21} />
          ) : (
            <Plane size={21} />
          )}
          <span>
            {saving
              ? "Đang lưu..."
              : success
                ? "Đã lưu thành công"
                : mode === "create"
                  ? "Hoàn tất & Tạo Tour"
                  : "Lưu thay đổi"}
          </span>
          {!saving && !success && (
            <ArrowRight size={18} className="absolute right-4" />
          )}
        </button>
        <p className="text-center text-[12px] text-[#8a9ab2]">
          {mode === "create"
            ? "Hoàn tất thông tin để tạo hành trình mới."
            : "Các thay đổi sẽ được cập nhật cho tour này."}
        </p>
      </div>
    </aside>
  );
}
