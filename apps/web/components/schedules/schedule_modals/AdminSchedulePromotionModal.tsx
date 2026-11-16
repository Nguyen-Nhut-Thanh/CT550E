"use client";

import { useEffect, useState } from "react";
import { formatVND } from "@/lib/utils/currency";
import {
  deleteSchedulePromotion,
  getSchedulePromotion,
  saveSchedulePromotion,
} from "@/lib/schedules/admin/api";
import { useToast } from "@/lib/notifications/useToast";
import { DateTimeInput } from "@/components/common/date_time/DateTimeInput";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Gift,
  HelpCircle,
  Loader2,
  Percent,
  Sparkles,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { AdminSchedule, SaveSchedulePromotionPayload, SchedulePromotion } from "shared";

interface SchedulePromotionModalProps {
  schedule: AdminSchedule | null;
  tourName?: string;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function SchedulePromotionModal({
  schedule,
  tourName,
  open,
  onClose,
  onSaved,
}: SchedulePromotionModalProps) {
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [existingPromotion, setExistingPromotion] = useState<SchedulePromotion | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed_amount">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [maxSlots, setMaxSlots] = useState<string>("");
  const [giftDescription, setGiftDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Load existing promotion whenever modal opens
  useEffect(() => {
    if (!open || !schedule) {
      setExistingPromotion(null);
      return;
    }

    let active = true;
    setLoading(true);

    getSchedulePromotion(schedule.tour_schedule_id)
      .then((promo) => {
        if (!active) return;
        setExistingPromotion(promo);
        if (promo) {
          setTitle(promo.title);
          setDiscountType(promo.discount_type === "fixed_amount" ? "fixed_amount" : "percentage");
          setDiscountValue(Number(promo.discount_value) || 0);
          setStartDate(promo.start_date ? new Date(promo.start_date) : new Date());
          setEndDate(promo.end_date ? new Date(promo.end_date) : new Date(schedule.start_date));
          setMaxSlots(promo.max_slots ? String(promo.max_slots) : "");
          setGiftDescription(promo.gift_description || "");
          setIsActive(promo.is_active);
        } else {
          // Defaults
          const depDate = new Date(schedule.start_date);
          const depStr = depDate.toLocaleDateString("vi-VN");
          setTitle(`Ưu đãi đợt ${depStr}`);
          setDiscountType("percentage");
          setDiscountValue(10);
          setStartDate(new Date());
          setEndDate(depDate);
          setMaxSlots(schedule.quota ? String(schedule.quota) : "");
          setGiftDescription("");
          setIsActive(true);
        }
      })
      .catch((err) => {
        if (!active) return;
        showError(err instanceof Error ? err.message : "Không thể tải dữ liệu ưu đãi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, schedule]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving && !deleting) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose, saving, deleting]);

  if (!open || !schedule) return null;

  const originalPrice = Number(schedule.price) || 0;
  const numDiscountValue = Number(discountValue) || 0;
  let calculatedDiscount = 0;
  if (discountType === "percentage") {
    calculatedDiscount = Math.round((originalPrice * Math.min(100, Math.max(0, numDiscountValue))) / 100);
  } else {
    calculatedDiscount = Math.min(originalPrice, Math.max(0, numDiscountValue));
  }
  const salePrice = Math.max(0, originalPrice - calculatedDiscount);

  const startDateObj = schedule.start_date ? new Date(schedule.start_date) : null;
  const endDateObj = schedule.end_date ? new Date(schedule.end_date) : null;
  const startStr = startDateObj && !isNaN(startDateObj.getTime())
    ? startDateObj.toLocaleDateString("vi-VN")
    : "Chưa xác định";
  const endStr = endDateObj && !isNaN(endDateObj.getTime())
    ? endDateObj.toLocaleDateString("vi-VN")
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showError("Vui lòng nhập tên chương trình ưu đãi.");
      return;
    }
    if (numDiscountValue <= 0) {
      showError("Giá trị giảm giá phải lớn hơn 0.");
      return;
    }
    if (discountType === "percentage" && numDiscountValue > 100) {
      showError("Giảm theo phần trăm không được vượt quá 100%.");
      return;
    }
    if (discountType === "fixed_amount" && numDiscountValue >= originalPrice) {
      showError("Số tiền giảm không được vượt quá hoặc bằng giá gốc.");
      return;
    }
    if (!startDate || !endDate) {
      showError("Vui lòng chọn thời gian áp dụng ưu đãi.");
      return;
    }
    if (endDate <= startDate) {
      showError("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }

    const payload: SaveSchedulePromotionPayload = {
      title: title.trim(),
      discount_type: discountType,
      discount_value: numDiscountValue,
      max_slots: maxSlots.trim() ? parseInt(maxSlots.trim(), 10) : null,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      gift_description: giftDescription.trim() || null,
      is_active: isActive,
    };

    setSaving(true);
    try {
      await saveSchedulePromotion(schedule.tour_schedule_id, payload);
      success("Đã lưu thiết lập ưu đãi cho đợt khởi hành!");
      onSaved?.();
      onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Lỗi khi lưu ưu đãi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa ưu đãi riêng của đợt khởi hành này?")) {
      return;
    }

    setDeleting(true);
    try {
      await deleteSchedulePromotion(schedule.tour_schedule_id);
      success("Đã xóa ưu đãi của đợt khởi hành thành công!");
      onSaved?.();
      onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Lỗi khi xóa ưu đãi.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="promotion-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => !saving && !deleting && onClose()}
      />

      {/* Modal Card */}
      <div className="relative z-10 my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl border border-[#dcecff] text-[#092448]">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          disabled={saving || deleting}
          aria-label="Đóng popup"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-slate-900 disabled:opacity-50"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <header className="relative isolate shrink-0 pt-6 pb-5 px-6 overflow-hidden border-b border-[#dcecff] bg-[linear-gradient(135deg,#eaf5ff_0%,#f0f8ff_60%,#e1f3ff_100%)]">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Gift size={18} />
            </span>
            <span className="uppercase text-[11px] tracking-wider text-blue-800 font-extrabold bg-white/90 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
              Ưu đãi đợt khởi hành
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Mã chuyến: #{schedule.tour_schedule_id}
            </span>
          </div>

          <h2 id="promotion-modal-title" className="text-lg sm:text-xl font-black text-[#092448]">
            {tourName || "Cấu hình ưu đãi chuyến đi"}
          </h2>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
            <span>
              Khởi hành: <strong className="text-slate-800">{startStr}</strong>
            </span>
            {endStr && (
              <>
                <span className="text-slate-400">→</span>
                <span>
                  Kết thúc: <strong className="text-slate-800">{endStr}</strong>
                </span>
              </>
            )}
            <span className="text-slate-400">·</span>
            <span>({schedule.quota} chỗ)</span>
            <span className="text-slate-400">·</span>
            <span>
              Giá gốc: <strong className="text-blue-700 font-bold">{formatVND(schedule.price)}</strong>
            </span>
          </div>
        </header>

        {loading ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 p-8">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="text-xs font-semibold text-slate-600">Đang tải thông tin ưu đãi...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Live Pricing Preview Box */}
            <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-sky-50/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                <span className="flex items-center gap-1.5 text-blue-800">
                  <Sparkles size={15} className="text-amber-500" /> Xem trước giá bán thực tế
                </span>
                {existingPromotion && (
                  <span className="text-[11px] text-slate-600 bg-white/80 px-2.5 py-0.5 rounded-full border border-blue-100 font-bold">
                    Đã áp dụng: {existingPromotion.used_slots} /{" "}
                    {existingPromotion.max_slots ? `${existingPromotion.max_slots} suất` : "Không giới hạn"}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 items-center text-center">
                <div className="rounded-xl bg-white/80 p-2.5 border border-slate-200/70">
                  <span className="block text-[11px] text-slate-500 font-medium">Giá gốc</span>
                  <span className="block text-sm sm:text-base font-bold text-slate-700 line-through">
                    {formatVND(originalPrice)}
                  </span>
                </div>

                <div className="rounded-xl bg-amber-50/90 p-2.5 border border-amber-200/70">
                  <span className="block text-[11px] text-amber-700 font-medium">Mức giảm</span>
                  <span className="block text-sm sm:text-base font-extrabold text-amber-600">
                    -{formatVND(calculatedDiscount)}
                    {discountType === "percentage" && (
                      <small className="text-xs font-semibold ml-1">({numDiscountValue}%)</small>
                    )}
                  </span>
                </div>

                <div className="rounded-xl bg-emerald-50/90 p-2.5 border border-emerald-200/70 shadow-2xs">
                  <span className="block text-[11px] text-emerald-700 font-medium">Giá sau ưu đãi</span>
                  <span className="block text-base sm:text-lg font-black text-emerald-600">
                    {formatVND(salePrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tên chương trình & Bật/Tắt */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Tên chương trình ưu đãi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Ưu đãi sớm Early Bird, Tri ân đợt mở bán..."
                  required
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Trạng thái</label>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-full h-10 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    isActive
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-slate-100 border-slate-200 text-slate-500"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                    }`}
                  />
                  {isActive ? "Đang bật" : "Tạm tắt"}
                </button>
              </div>
            </div>

            {/* Loại giảm giá & Giá trị */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Loại giảm giá</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType("percentage")}
                    className={`h-10 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      discountType === "percentage"
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Percent size={14} /> Theo phần trăm (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("fixed_amount")}
                    className={`h-10 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      discountType === "fixed_amount"
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Tag size={14} /> Số tiền cố định (đ)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Mức giảm {discountType === "percentage" ? "(%)" : "(VNĐ)"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={discountType === "percentage" ? "100" : String(originalPrice - 1)}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  required
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>

            {/* Thời gian áp dụng: Bắt đầu -> Kết thúc */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Thời gian bắt đầu áp dụng <span className="text-rose-500">*</span>
                </label>
                <DateTimeInput
                  value={startDate}
                  onChange={(d) => setStartDate(d)}
                  placeholder="Chọn ngày và giờ bắt đầu"
                  ariaLabel="Thời gian bắt đầu áp dụng"
                  className="[&_button]:min-h-10 [&_button]:h-10 [&_button]:rounded-xl [&_button]:border-slate-200 [&_button]:shadow-2xs text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Thời gian kết thúc ưu đãi <span className="text-rose-500">*</span>
                </label>
                <DateTimeInput
                  value={endDate}
                  onChange={(d) => setEndDate(d)}
                  minDate={startDate ?? undefined}
                  placeholder="Chọn ngày và giờ kết thúc"
                  ariaLabel="Thời gian kết thúc ưu đãi"
                  className="[&_button]:min-h-10 [&_button]:h-10 [&_button]:rounded-xl [&_button]:border-slate-200 [&_button]:shadow-2xs text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Giới hạn suất & Quà tặng kèm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Số suất tối đa áp dụng{" "}
                  <span className="text-slate-400 font-normal">(để trống = toàn bộ chỗ)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={String(schedule.quota || 999)}
                    value={maxSlots}
                    onChange={(e) => setMaxSlots(e.target.value)}
                    placeholder={`Tối đa ${schedule.quota} khách`}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
                  />
                  <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Quà tặng / Quyền lợi tặng kèm{" "}
                  <span className="text-slate-400 font-normal">(tùy chọn)</span>
                </label>
                <input
                  type="text"
                  value={giftDescription}
                  onChange={(e) => setGiftDescription(e.target.value)}
                  placeholder="Ví dụ: Tặng balo du lịch, bảo hiểm nâng cao..."
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              {existingPromotion ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving || deleting}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition disabled:opacity-50"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  <span>Xóa ưu đãi</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving || deleting}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving || deleting}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Lưu thiết lập</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

