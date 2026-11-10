"use client";

import { useEffect, useId, useMemo, useState, type RefObject } from "react";
import { getPublicTours } from "@/lib/tours/api";
import { formatVND } from "@/lib/utils/currency";
import { CalendarDays, Clock, MapPin, Search, X } from "lucide-react";
import type { PublicTourCard } from "shared";

const TOUR_TYPE_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "domestic", label: "Trong nước" },
  { value: "outbound", label: "Ngoài nước" },
  { value: "international", label: "Quốc tế" },
] as const;

export function VoucherTourPickerModal({
  open,
  onClose,
  selectedIds,
  onSave,
  anchorRef,
}: {
  open: boolean;
  onClose: () => void;
  selectedIds: number[];
  onSave: (ids: number[], toursMap: Record<number, PublicTourCard>) => void;
  anchorRef: RefObject<HTMLButtonElement | null>;
}) {
  const titleId = useId();
  const [search, setSearch] = useState("");
  const [tourTypeFilter, setTourTypeFilter] = useState<string>("all");
  const [tours, setTours] = useState<PublicTourCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempSelectedIds, setTempSelectedIds] = useState<number[]>(selectedIds);
  const [toursMap, setToursMap] = useState<Record<number, PublicTourCard>>({});
  const [position, setPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!open) return;
    const placePicker = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const width = Math.min(500, window.innerWidth - 32);
      const height = Math.min(520, window.innerHeight - 32);
      const left = rect.right + 12 + width <= window.innerWidth
        ? rect.right + 12
        : Math.max(16, rect.left - width - 12);
      const top = Math.min(Math.max(16, rect.top), window.innerHeight - height - 16);
      setPosition({ left, top });
    };
    placePicker();
    window.addEventListener("resize", placePicker);
    window.addEventListener("scroll", placePicker, true);
    return () => {
      window.removeEventListener("resize", placePicker);
      window.removeEventListener("scroll", placePicker, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (open) {
      setTempSelectedIds(selectedIds);
    }
  }, [open, selectedIds]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);

    const timer = setTimeout(() => {
      getPublicTours({ search: search.trim() || undefined, take: 100 })
        .then((result) => {
          if (!active) return;
          setTours(result.items || []);
          setToursMap((prev) => {
            const next = { ...prev };
            result.items.forEach((item) => {
              next[item.tour_id] = item;
            });
            return next;
          });
        })
        .catch(() => {
          if (active) setTours([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, search]);

  const filteredTours = useMemo(() => {
    if (tourTypeFilter === "all") return tours;
    return tours.filter((t) => t.tour_type === tourTypeFilter);
  }, [tours, tourTypeFilter]);

  if (!open) return null;

  const toggleTour = (tour: PublicTourCard) => {
    setToursMap((prev) => ({ ...prev, [tour.tour_id]: tour }));
    setTempSelectedIds((prev) =>
      prev.includes(tour.tour_id)
        ? prev.filter((id) => id !== tour.tour_id)
        : [...prev, tour.tour_id],
    );
  };

  const handleSelectAllFiltered = () => {
    const idsToAdd = filteredTours.map((t) => t.tour_id);
    setTempSelectedIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const handleDeselectAllFiltered = () => {
    const idsToRemove = new Set(filteredTours.map((t) => t.tour_id));
    setTempSelectedIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
  };

  const handleConfirm = () => {
    onSave(tempSelectedIds, toursMap);
    onClose();
  };

  return (
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        style={{ left: position.left, top: position.top }}
        className="fixed z-[110] flex h-[min(520px,calc(100dvh-32px))] w-[min(500px,calc(100vw-32px))] flex-col overflow-hidden rounded-xl border border-[#dce5f3] bg-white shadow-xl shadow-slate-900/15"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-3">
          <div>
            <h3 id={titleId} className="text-[13px] font-bold text-slate-900">
              Chọn tour áp dụng voucher
            </h3>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Tích chọn một hoặc nhiều tour được hưởng mức giảm giá từ mã này
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng popup chọn tour"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Type filter bar */}
        <div className="border-b border-slate-100 bg-[#f9fbff] p-2.5 space-y-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên tour hoặc mã tour..."
              className="w-full h-[32px] pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-[10px] font-medium text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Tour Type Filter tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg">
              {TOUR_TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setTourTypeFilter(f.value)}
                  className={`px-2 py-1 rounded-md text-[9px] font-semibold transition-all ${
                    tourTypeFilter === f.value
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Quick bulk action */}
            <div className="flex items-center gap-1.5 text-[9px]">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="font-medium text-blue-600 hover:underline"
              >
                Chọn tất cả ({filteredTours.length})
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleDeselectAllFiltered}
                className="font-medium text-slate-500 hover:underline"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        </div>

        {/* Tour List Content */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 min-h-0">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Đang tải danh sách tour...
            </div>
          ) : filteredTours.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Không tìm thấy tour nào phù hợp với tìm kiếm.
            </div>
          ) : (
            filteredTours.map((tour) => {
              const isSelected = tempSelectedIds.includes(tour.tour_id);
              const price = tour.next_schedule?.price ?? tour.base_price;
              const formattedDate = tour.next_schedule?.start_date
                ? new Date(tour.next_schedule.start_date).toLocaleDateString("vi-VN", {
                    timeZone: "Asia/Ho_Chi_Minh",
                  })
                : null;

              return (
                <div
                  key={tour.tour_id}
                  onClick={() => toggleTour(tour)}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#095fff] bg-[#f0f6ff] shadow-sm"
                      : "border-[#e2eaf5] bg-white hover:bg-slate-50 hover:border-[#cbd9ec]"
                  }`}
                >
                  {/* Ô tích chọn bên trái sát cùng */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by card click
                    aria-label={`Chọn tour ${tour.name}`}
                    className="size-3.5 shrink-0 rounded accent-[#095fff] cursor-pointer"
                  />

                  {/* Hình ảnh tour */}
                  <div className="relative w-14 h-12 shrink-0 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                    {tour.cover_image ? (
                      <img
                        src={tour.cover_image}
                        alt={tour.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <MapPin size={22} />
                      </div>
                    )}
                  </div>

                  {/* Thông tin tour: tên, ngày khởi hành, thời gian chuyến đi */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className="text-[10px] font-bold text-slate-900 truncate"
                        title={tour.name}
                      >
                        {tour.name}
                      </h4>
                      <span className="shrink-0 text-[8px] px-1 py-0.5 rounded font-mono font-semibold bg-slate-100 text-slate-600">
                        #{tour.code}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] text-slate-500">
                      <span className="flex items-center gap-1 text-slate-600">
                        <CalendarDays size={11} className="text-[#3c7cff]" />
                        {formattedDate ? `Khởi hành: ${formattedDate}` : "Khởi hành linh hoạt"}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock size={11} className="text-[#ff922b]" />
                        {tour.duration_days} ngày {tour.duration_nights} đêm
                      </span>
                    </div>
                  </div>

                  {/* Giá tour */}
                  <div className="shrink-0 text-right pl-2">
                    <p className="text-[10px] font-extrabold text-[#095fff]">
                      {formatVND(price)}
                    </p>
                    <p className="text-[10px] text-slate-400">/ khách</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-3.5 py-2">
          <p className="text-[10px] font-semibold text-slate-700">
            Đã chọn:{" "}
            <span className="text-[#095fff] font-bold">
              {tempSelectedIds.length} tour
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-3.5 py-1.5 rounded-lg bg-[#095fff] text-[10px] font-bold text-white shadow-sm hover:bg-[#0752df]"
            >
              Xác nhận ({tempSelectedIds.length})
            </button>
          </div>
        </div>
      </div>
  );
}

