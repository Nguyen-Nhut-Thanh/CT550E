"use client";

import { Dialog } from "@/components/common/dialogs_and_feedback/dialogs/Dialog";
import { ConfirmDialog } from "@/components/common/dialogs_and_feedback/dialogs/ConfirmDialog";
import { PriceInput } from "@/components/common/form_controls/PriceInput";
import { previewFlashDealPrice } from "@/lib/flash_deals/admin/forms";
import { formatVND } from "@/lib/utils/currency";
import {
  ArrowRight,
  ChartNoAxesCombined,
  Clock,
  Gift,
  Loader2,
  Save,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useId, useState } from "react";
import type { FlashDealModalProps } from "shared";
import { FlashDealPromotion } from "@/components/flash_deals/AdminFlashDealPromotion";

export function FlashDealModal({
  open,
  saving,
  deleting,
  schedule,
  form,
  onClose,
  onChange,
  onSave,
  onDelete,
}: FlashDealModalProps) {
  const id = useId();
  const [confirmPriorityOpen, setConfirmPriorityOpen] = useState(false);
  if (!open) return null;

  const percentage = form.discount_type === "percentage";
  const price = Number(schedule?.price ?? 0);
  const invalidPercentage = percentage && form.discount_value > 100;
  const hours = Math.max(0, Number(form.hours_before) || 0);
  const close = () => {
    if (!saving && !deleting) onClose();
  };

  return (
    <Dialog
      onClose={close}
      labelledBy={`${id}-title`}
      describedBy={`${id}-description`}
      overlayClassName="bg-slate-900/50"
    >
      <div className="w-[min(640px,_calc(100vw_-_48px))] max-w-full max-h-[calc(100dvh_-_32px)] min-[1024px]:w-[min(900px,_calc(100vw_-_48px))] min-[1024px]:grid-cols-[260px_minmax(0,_1fr)] my-auto grid overflow-y-auto rounded-[20px] bg-white border border-[#e1edfc] shadow-2xl">
        <FlashDealPromotion />
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (saving || deleting || invalidPercentage || !schedule) return;

            if (schedule.schedule_promotions) {
              setConfirmPriorityOpen(true);
              return;
            }

            onSave();
          }}
          className="relative flex min-w-0 flex-col gap-2.5 sm:gap-3 p-4 sm:p-5"
        >
          <header className="pr-10">
            <h2
              id={`${id}-title`}
              className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0b1747]"
            >
              Thiết lập Flash Deal
            </h2>
            <p
              id={`${id}-description`}
              className="mt-0.5 text-xs text-[#637da5] sm:text-[13px]"
            >
              Cấu hình thông tin ưu đãi cho tour này.
            </p>
          </header>
          <button
            type="button"
            onClick={close}
            disabled={saving || deleting}
            aria-label="Đóng thiết lập Flash Deal"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f5fa] text-[#647794] transition hover:bg-slate-200 focus-visible:outline-blue-500 disabled:opacity-50 cursor-pointer sm:right-5 sm:top-5"
          >
            <X size={18} />
          </button>

          {schedule?.schedule_promotions && (
            <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/90 to-sky-50/70 p-2 px-3 text-[11.5px] leading-snug text-blue-900 shadow-2xs">
              <div className="flex items-start gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white mt-0.5">
                  <Gift size={12} />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-blue-950 text-xs">
                    Đợt khởi hành này đang có Ưu đãi đợt: &ldquo;{(schedule.schedule_promotions as any).title || (schedule.schedule_promotions as any).promotion_title || "Ưu đãi đợt khởi hành"}&rdquo;
                  </p>
                  <p className="text-blue-800">
                    Lưu ý: Hệ thống luôn <strong>ưu tiên áp dụng Flash Deal trước</strong>. Trong suốt thời gian Flash Deal diễn ra, giá Flash Deal sẽ thay thế ưu đãi đợt này.
                  </p>
                </div>
              </div>
            </div>
          )}

          <fieldset
            disabled={saving}
            className="rounded-xl border border-[#edf1f8] bg-gradient-to-br from-white to-[#f7f9fe] p-2.5 sm:p-3"
          >
            <legend className="sr-only">Loại ưu đãi</legend>
            <div
              aria-hidden="true"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#526da8] sm:text-[13px]"
            >
              <Tag size={16} className="fill-[#6d88bc] text-[#6d88bc]" />
              Loại ưu đãi
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                aria-pressed={percentage}
                onClick={() =>
                  onChange((current) => ({
                    ...current,
                    discount_type: "percentage",
                  }))
                }
                className={`flex min-h-9 sm:min-h-9.5 items-center justify-center rounded-lg border px-3 py-1 text-xs sm:text-[13px] font-bold transition ${percentage ? "border-[#7ea7ff] bg-[#edf5ff] text-[#075bff] ring-1 ring-blue-100/60" : "border-[#e4eaf3] bg-white text-[#566987] hover:border-blue-300"}`}
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
                className={`flex min-h-9 sm:min-h-9.5 items-center justify-center rounded-lg border px-3 py-1 text-xs sm:text-[13px] font-bold transition ${!percentage ? "border-[#7ea7ff] bg-[#edf5ff] text-[#075bff] ring-1 ring-blue-100/60" : "border-[#e4eaf3] bg-white text-[#566987] hover:border-blue-300"}`}
              >
                Giảm theo số tiền
              </button>
            </div>
          </fieldset>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-xl border border-[#edf1f8] bg-gradient-to-br from-white to-[#f7f9fe] p-2.5 sm:p-3">
              <label
                htmlFor={`${id}-discount`}
                className="mb-1 block text-xs font-bold text-[#667b9b] sm:text-[13px]"
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
                inputClassName="h-9 sm:h-9.5 w-full rounded-lg border border-[#e2e9f4] bg-white py-1 pl-3 pr-10 text-sm font-semibold text-[#142344] placeholder:font-medium placeholder:text-slate-400 shadow-2xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50 disabled:opacity-60"
                disabled={saving}
                error={
                  invalidPercentage ? "Mức giảm tối đa là 100%." : undefined
                }
              />
            </div>
            <div className="rounded-xl border border-[#edf1f8] bg-gradient-to-br from-white to-[#f7f9fe] p-2.5 sm:p-3">
              <label
                htmlFor={`${id}-hours`}
                className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[#667b9b] sm:text-[13px]"
              >
                <Clock size={16} />
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
                  className="h-9 sm:h-9.5 w-full rounded-lg border border-[#e2e9f4] bg-white py-1 pl-3 pr-10 text-sm font-semibold text-[#142344] placeholder:font-medium placeholder:text-slate-400 shadow-2xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50 disabled:opacity-60"
                  style={{ paddingLeft: "0.75rem" }}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#7385a2]">
                  giờ
                </span>
              </div>
              <p className="mt-1 text-[11px] italic leading-tight text-[#6684ca]">
                Bật trước khởi hành {Math.floor(hours / 24)} ngày {hours % 24}h.
              </p>
            </div>
          </div>

          <section
            aria-label="Xem trước giá tour"
            className="rounded-xl border border-[#edf1f8] bg-gradient-to-br from-white to-[#f7f9fe] p-2.5 sm:p-3"
          >
            <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#4764ad] sm:text-[13px]">
              <ChartNoAxesCombined size={16} />
              Xem trước giá tour
            </h3>
            <div
              aria-live="polite"
              className="grid items-center gap-2 rounded-xl border border-[#f0f3f9] bg-white px-3 py-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-3 sm:px-4"
            >
              <div>
                <p className="text-[11px] font-medium text-[#7184a3]">
                  Giá gốc
                </p>
                <p className="whitespace-nowrap text-sm font-bold italic text-[#99a7c1] line-through decoration-2 sm:text-base">
                  {formatVND(price)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:flex-col">
                <span className="whitespace-nowrap rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
                  Giảm{" "}
                  {percentage
                    ? `${form.discount_value}%`
                    : formatVND(form.discount_value)}
                </span>
                <ArrowRight size={16} className="text-red-400" />
              </div>
              <div className="sm:justify-self-end">
                <p className="text-[11px] font-medium text-red-500">
                  Giá sau giảm
                </p>
                <p className="whitespace-nowrap text-base font-extrabold text-red-600 sm:text-lg">
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

          <p className="flex items-center gap-2 rounded-xl bg-[#eaf3ff] px-3 py-1.5 text-[11px] leading-tight text-[#1467ff] sm:text-xs">
            <Gift size={16} className="shrink-0" />
            Sau khi lưu, flash deal sẽ tự động áp dụng cho tour trong thời gian đã đặt trước.
          </p>
          <footer className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#edf2fb] sm:gap-3">
            {schedule?.flash_deals && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={saving || deleting}
                className="min-h-9 flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
                <span>Xóa Flash Deal</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={close}
                disabled={saving || deleting}
                className="min-h-9 rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs sm:text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={saving || deleting || !schedule || invalidPercentage}
                className="flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-[#075bff] px-5 py-1.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-[#064ecc] focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>{saving ? "Đang lưu..." : "Lưu flash deal"}</span>
              </button>
            </div>
          </footer>
        </form>
      </div>

      <ConfirmDialog
        open={confirmPriorityOpen}
        icon={<Sparkles size={32} className="text-amber-500" />}
        title="Ưu tiên sử dụng Flash Deal"
        description={`Đợt khởi hành này hiện đã có ưu đãi: "${(schedule?.schedule_promotions as any)?.title || (schedule?.schedule_promotions as any)?.promotion_title || "Ưu đãi đợt khởi hành"}".\n\nKhi kích hoạt Flash Deal, hệ thống sẽ tự động ƯU TIÊN áp dụng giá Flash Deal trong khoảng thời gian diễn ra.\n\nBạn có xác nhận lưu và ưu tiên Flash Deal không?`}
        confirmLabel={saving ? "Đang lưu..." : "Xác nhận lưu"}
        cancelLabel="Quay lại"
        confirmClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200"
        onConfirm={() => {
          setConfirmPriorityOpen(false);
          onSave();
        }}
        onCancel={() => setConfirmPriorityOpen(false)}
      />
    </Dialog>
  );
}
