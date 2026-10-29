"use client";

import { Dialog } from "@/components/common/overlays/Dialog";
import { PriceInput } from "@/components/common/forms/PriceInput";
import { previewFlashDealPrice } from "@/lib/admin/flash-deals/forms";
import { formatVND } from "@/lib/utils/currency";
import {
  ArrowRight,
  ChartNoAxesCombined,
  Clock,
  Gift,
  Loader2,
  Save,
  Tag,
  X,
} from "lucide-react";
import { useId } from "react";
import type { FlashDealModalProps } from "shared";
import { FlashDealPromotion } from "./FlashDealPromotion";

export function FlashDealModal({
  open,
  saving,
  schedule,
  form,
  onClose,
  onChange,
  onSave,
}: FlashDealModalProps) {
  const id = useId();
  if (!open) return null;

  const percentage = form.discount_type === "percentage";
  const price = Number(schedule?.price ?? 0);
  const invalidPercentage = percentage && form.discount_value > 100;
  const hours = Math.max(0, Number(form.hours_before) || 0);
  const close = () => {
    if (!saving) onClose();
  };

  return (
    <Dialog
      onClose={close}
      labelledBy={`${id}-title`}
      describedBy={`${id}-description`}
      overlayClassName="bg-slate-900/50"
    >
      <div className="ui-flash-deal-modal-modal w-[min(640px,_calc(100vw_-_48px))] max-w-full max-h-[calc(100dvh_-_64px)] min-[1024px]:w-[min(920px,_calc(100vw_-_64px))] min-[1024px]:grid-cols-[280px_minmax(0,_1fr)] admin-max-639:w-full admin-max-639:max-h-[calc(100dvh_-_32px)] my-auto grid overflow-y-auto rounded-[24px] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.3)]">
        <FlashDealPromotion />
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!saving && !invalidPercentage && schedule) onSave();
          }}
          className="ui-flash-deal-modal-form [&&]:gap-[18px] [&&]:p-[24px] [&_header_h2]:text-[27px] [&_header_h2]:leading-[1.3] [&_header_p]:text-[14px] [&_.ui-flash-deal-modal-panel]:p-[16px] admin-max-639:[&&]:p-[20px] admin-max-639:[&&]:gap-[16px] admin-max-639:[&_header_h2]:text-[23px] admin-short-desktop:[&&]:gap-[10px] admin-short-desktop:[&&]:p-[20px_24px] admin-short-desktop:[&_header_h2]:text-[26px] admin-short-desktop:[&_header_h2]:leading-[34px] admin-short-desktop:[&_header_p]:mt-[4px] admin-short-desktop:[&_header_p]:text-[14px] admin-short-desktop:[&_header_p]:leading-[20px] admin-short-desktop:[&_.ui-flash-deal-modal-panel]:p-[12px_16px] admin-short-desktop:[&_fieldset>div:first-of-type]:mb-[8px] admin-short-desktop:[&_fieldset>div:first-of-type]:text-[13px] admin-short-desktop:[&_fieldset>div:first-of-type]:leading-[20px] admin-short-desktop:[&_fieldset_button]:min-h-[44px] admin-short-desktop:[&_fieldset_button]:py-[6px] admin-short-desktop:[&_fieldset_button]:text-[14px] admin-short-desktop:[&_input]:h-[44px] admin-short-desktop:[&_section>div]:p-[12px_16px] admin-short-desktop:[&>p]:py-[10px] admin-short-desktop:[&>p]:text-[12px] admin-short-desktop:[&>p]:leading-[20px] admin-short-desktop:[&_footer_button]:min-h-[44px] admin-short-desktop:[&_footer_button]:py-[10px] admin-short-desktop:[&_footer_button]:text-[14px] relative flex min-w-0 flex-col gap-5 p-5 sm:p-7 xl:gap-6 xl:p-10"
        >
          <header className="pr-12">
            <h2
              id={`${id}-title`}
              className="text-2xl font-extrabold tracking-tight text-[#101e3d] sm:text-[30px] xl:text-[32px]"
            >
              Thiết lập Flash Deal
            </h2>
            <p
              id={`${id}-description`}
              className="mt-1.5 text-sm leading-relaxed text-[#7387aa] sm:text-base"
            >
              Cấu hình thông tin ưu đãi cho tour này.
            </p>
          </header>
          <button
            type="button"
            onClick={close}
            disabled={saving}
            aria-label="Đóng thiết lập Flash Deal"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f5fa] text-[#647794] transition hover:bg-slate-200 focus-visible:outline-blue-500 disabled:opacity-50 sm:right-7 sm:top-7 xl:right-8 xl:top-8"
          >
            <X size={23} />
          </button>

          <fieldset
            disabled={saving}
            className="ui-flash-deal-modal-panel admin-short-desktop:[&_label]:mb-[8px] admin-short-desktop:[&_label]:text-[13px] admin-short-desktop:[&_label]:leading-[20px] admin-short-desktop:[&_h3]:mb-[8px] admin-short-desktop:[&_h3]:text-[13px] admin-short-desktop:[&_h3]:leading-[20px] admin-short-desktop:[&>p]:mt-[4px] admin-short-desktop:[&>p]:text-[12px] admin-short-desktop:[&>p]:leading-[18px] rounded-[20px] border border-[#edf1f8] bg-gradient-to-br from-white to-[#f7f9fe] p-4 sm:p-5"
          >
            <legend className="sr-only">Loại ưu đãi</legend>
            <div
              aria-hidden="true"
              className="mb-3 flex items-center gap-2.5 text-sm font-bold text-[#526da8] sm:text-base"
            >
              <Tag size={20} className="fill-[#6d88bc] text-[#6d88bc]" />
              Loại ưu đãi
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                aria-pressed={percentage}
                onClick={() =>
                  onChange((current) => ({
                    ...current,
                    discount_type: "percentage",
                  }))
                }
                className={`flex min-h-12 items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-bold transition ${percentage ? "border-[#7ea7ff] bg-[#edf5ff] text-[#075bff] ring-1 ring-blue-100/60" : "border-[#e4eaf3] bg-white text-[#566987] hover:border-blue-300"}`}
              >
                Giảm theo %
              </button>
              <button
                type="button"
                aria-pressed={!percentage}
                onClick={() =>
                  onChange((current) => ({
                    ...current,
                    discount_type: "fixed_amount",
                  }))
                }
                className={`flex min-h-12 items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-bold transition ${!percentage ? "border-[#7ea7ff] bg-[#edf5ff] text-[#075bff] ring-1 ring-blue-100/60" : "border-[#e4eaf3] bg-white text-[#566987] hover:border-blue-300"}`}
              >
                Giảm theo số tiền
              </button>
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="ui-flash-deal-modal-panel admin-short-desktop:[&_label]:mb-[8px] admin-short-desktop:[&_label]:text-[13px] admin-short-desktop:[&_label]:leading-[20px] admin-short-desktop:[&_h3]:mb-[8px] admin-short-desktop:[&_h3]:text-[13px] admin-short-desktop:[&_h3]:leading-[20px] admin-short-desktop:[&>p]:mt-[4px] admin-short-desktop:[&>p]:text-[12px] admin-short-desktop:[&>p]:leading-[18px] rounded-[20px] border border-[#edf1f8] bg-gradient-to-br from-white to-[#f7f9fe] p-4 sm:p-5">
              <label
                htmlFor={`${id}-discount`}
                className="mb-3 block text-sm font-bold text-[#667b9b]"
              >
                {percentage ? "Mức giảm giá (%)" : "Mức giảm giá (VND)"}
              </label>
              <PriceInput
                id={`${id}-discount`}
                label=""
                value={form.discount_value}
                onChange={(value) =>
                  onChange((current) => ({ ...current, discount_value: value }))
                }
                placeholder={percentage ? "12" : "500.000"}
                suffix={percentage ? "%" : "đ"}
                icon={null}
                inputClassName="h-12 w-full rounded-xl border border-[#e2e9f4] bg-white py-3 pl-4 pr-12 text-base font-semibold text-[#142344] placeholder:font-medium placeholder:text-slate-400 shadow-sm shadow-slate-100/60 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:opacity-60"
                disabled={saving}
                error={
                  invalidPercentage ? "Mức giảm tối đa là 100%." : undefined
                }
              />
            </div>
            <div className="ui-flash-deal-modal-panel admin-short-desktop:[&_label]:mb-[8px] admin-short-desktop:[&_label]:text-[13px] admin-short-desktop:[&_label]:leading-[20px] admin-short-desktop:[&_h3]:mb-[8px] admin-short-desktop:[&_h3]:text-[13px] admin-short-desktop:[&_h3]:leading-[20px] admin-short-desktop:[&>p]:mt-[4px] admin-short-desktop:[&>p]:text-[12px] admin-short-desktop:[&>p]:leading-[18px] rounded-[20px] border border-[#edf1f8] bg-gradient-to-br from-white to-[#f7f9fe] p-4 sm:p-5">
              <label
                htmlFor={`${id}-hours`}
                className="mb-3 flex items-center gap-2.5 text-sm font-bold text-[#667b9b]"
              >
                <Clock size={20} />
                Thời gian kích hoạt
              </label>
              <div className="relative">
                <input
                  id={`${id}-hours`}
                  type="number"
                  min={1}
                  step={1}
                  required
                  placeholder="72"
                  disabled={saving}
                  value={form.hours_before ? String(form.hours_before) : ""}
                  onChange={(event) =>
                    onChange((current) => ({
                      ...current,
                      hours_before: Number(event.target.value),
                    }))
                  }
                  className="h-12 w-full rounded-xl border border-[#e2e9f4] bg-white py-3 pl-4 pr-12 text-base font-semibold text-[#142344] placeholder:font-medium placeholder:text-slate-400 shadow-sm shadow-slate-100/60 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:opacity-60"
                  style={{ paddingLeft: "1rem" }}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#7385a2]">
                  giờ
                </span>
              </div>
              <p className="mt-2 text-xs italic leading-relaxed text-[#6684ca] sm:text-[13px]">
                Bật trước khởi hành {Math.floor(hours / 24)} ngày {hours % 24}h.
              </p>
            </div>
          </div>

          <section
            aria-label="Xem trước giá tour"
            className="ui-flash-deal-modal-panel admin-short-desktop:[&_label]:mb-[8px] admin-short-desktop:[&_label]:text-[13px] admin-short-desktop:[&_label]:leading-[20px] admin-short-desktop:[&_h3]:mb-[8px] admin-short-desktop:[&_h3]:text-[13px] admin-short-desktop:[&_h3]:leading-[20px] admin-short-desktop:[&>p]:mt-[4px] admin-short-desktop:[&>p]:text-[12px] admin-short-desktop:[&>p]:leading-[18px] rounded-[20px] border border-[#edf1f8] bg-gradient-to-br from-white to-[#f7f9fe] p-4 sm:p-5"
          >
            <h3 className="mb-4 flex items-center gap-2.5 text-sm font-bold text-[#4764ad] sm:text-base">
              <ChartNoAxesCombined size={21} />
              Xem trước giá tour
            </h3>
            <div
              aria-live="polite"
              className="grid items-center gap-3 rounded-2xl border border-[#f0f3f9] bg-white px-4 py-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-5"
            >
              <div>
                <p className="text-xs font-medium text-[#7184a3] sm:text-sm">
                  Giá gốc
                </p>
                <p className="mt-1 whitespace-nowrap text-lg font-bold italic text-[#99a7c1] line-through decoration-2 xl:text-2xl">
                  {formatVND(price)}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:flex-col">
                <span className="whitespace-nowrap rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-red-600">
                  Giảm{" "}
                  {percentage
                    ? `${form.discount_value}%`
                    : formatVND(form.discount_value)}
                </span>
                <ArrowRight size={22} className="text-red-400" />
              </div>
              <div className="sm:justify-self-end">
                <p className="text-xs font-medium text-red-500 sm:text-sm">
                  Giá sau giảm
                </p>
                <p className="mt-1 whitespace-nowrap text-xl font-extrabold text-red-600 sm:text-2xl">
                  {formatVND(
                    previewFlashDealPrice(
                      price,
                      form.discount_type,
                      form.discount_value,
                    ),
                  )}
                </p>
              </div>
            </div>
          </section>

          <p className="flex items-center gap-3 rounded-2xl bg-[#eaf3ff] px-4 py-3 text-xs leading-relaxed text-[#1467ff] sm:text-sm">
            <Gift size={22} className="shrink-0" />
            Sau khi lưu, flash deal sẽ tự động áp dụng cho tour trong thời gian
            đã đặt trước.
          </p>
          <footer className="grid grid-cols-[1fr_1.8fr] gap-3 sm:gap-4">
            <button
              type="button"
              onClick={close}
              disabled={saving}
              className="min-h-12 rounded-2xl border border-[#e5ebf5] bg-white px-4 py-3 text-sm font-bold text-[#5e718e] shadow-sm transition hover:bg-slate-50 disabled:opacity-50 sm:text-base"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving || !schedule || invalidPercentage}
              className="flex min-h-12 items-center justify-center gap-2.5 rounded-2xl bg-[#0e5bff] px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/15 transition hover:bg-blue-700 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            >
              {saving ? (
                <Loader2 size={21} className="animate-spin" />
              ) : (
                <Save size={21} />
              )}
              {saving ? "Đang lưu..." : "Lưu flash deal"}
            </button>
          </footer>
        </form>
      </div>
    </Dialog>
  );
}
