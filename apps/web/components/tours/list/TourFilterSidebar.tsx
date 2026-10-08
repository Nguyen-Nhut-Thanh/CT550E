"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  MapPin,
  Plane,
  Search,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";
import CustomDropdown from "@/components/common/CustomDropdown";
import { BUDGET_OPTIONS } from "@/lib/client/utils/searchBar.utils";
import TourFilterCalendar from "./TourFilterCalendar";

type TourFilterSidebarProps = {
  keyword: string;
  setKeyword: (val: string) => void;
  destination: string;
  setDestination: (val: string) => void;
  dateFrom: string;
  setDateFrom: (val: string) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  tourType: string;
  setTourType: (val: string) => void;
  duration: string;
  setDuration: (val: string) => void;
  onApplyFilters: () => void;
  totalResults: number;
};

const DESTINATION_OPTIONS = [
  { label: "Tất cả điểm đến", value: "" },
  { label: "Hà Nội", value: "Hà Nội" },
  { label: "Đà Nẵng", value: "Đà Nẵng" },
  { label: "Phú Quốc", value: "Phú Quốc" },
  { label: "Sapa", value: "Sapa" },
  { label: "Đà Lạt", value: "Đà Lạt" },
  { label: "Nha Trang", value: "Nha Trang" },
  { label: "Vịnh Hạ Long", value: "Hạ Long" },
  { label: "Hội An", value: "Hội An" },
  { label: "Cần Thơ", value: "Cần Thơ" },
  { label: "Ninh Bình", value: "Ninh Bình" },
  { label: "Quy Nhơn", value: "Quy Nhơn" },
];

const DURATION_OPTIONS = [
  { label: "Tất cả thời gian", value: "all" },
  { label: "1 - 3 ngày", value: "1-3" },
  { label: "4 - 7 ngày", value: "4-7" },
  { label: "Trên 7 ngày", value: "8+" },
];

const TOUR_TYPE_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Tour trong nước", value: "domestic" },
  { label: "Tour nước ngoài", value: "international" },
];

export default function TourFilterSidebar({
  keyword,
  setKeyword,
  destination,
  setDestination,
  dateFrom,
  setDateFrom,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  tourType,
  setTourType,
  duration,
  setDuration,
  onApplyFilters,
  totalResults,
}: TourFilterSidebarProps) {
  // Option ngân sách
  const budgetOptions = [
    { label: "Tất cả mức giá", value: "-1" },
    ...BUDGET_OPTIONS.filter((_, idx) => idx !== 0).map((p, idx) => ({
      label: p.label,
      value: (idx + 1).toString(),
    })),
  ];

  const selectedBudgetIndex = BUDGET_OPTIONS.findIndex((p, idx) => {
    if (idx === 0) return false;
    return (p.minPrice || "") === minPrice && (p.maxPrice || "") === maxPrice;
  });

  const selectedBudgetValue =
    selectedBudgetIndex > 0 ? selectedBudgetIndex.toString() : "";

  const handleSelectBudget = (val: string) => {
    if (val === "" || val === "-1") {
      setMinPrice("");
      setMaxPrice("");
    } else {
      const optionIndex = parseInt(val, 10);
      const option = BUDGET_OPTIONS[optionIndex];
      if (option) {
        setMinPrice(option.minPrice || "");
        setMaxPrice(option.maxPrice || "");
      }
    }
  };

  return (
    <aside className="w-full flex-shrink-0 space-y-4 lg:sticky lg:top-20 lg:w-[260px] xl:w-[280px]">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]">
        {/* Header */}
        <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white shadow-md shadow-sky-200">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <h2 className="text-[15px] font-extrabold uppercase tracking-tight text-[#123d78]">
            Bộ lọc tìm kiếm
          </h2>
        </div>

        <div className="space-y-4">
          {/* 1. TỪ KHÓA */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-extrabold uppercase tracking-wider text-slate-700">
              Từ khóa
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onApplyFilters()}
                placeholder="Tên tour, điểm đến,..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-[13.5px] font-medium text-slate-700 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100/60"
              />
            </div>
          </div>

          {/* 2. ĐIỂM ĐẾN */}
          <CustomDropdown
            label="Điểm đến"
            icon={MapPin}
            options={DESTINATION_OPTIONS}
            selectedValue={destination}
            placeholder="Tất cả điểm đến"
            onSelect={setDestination}
            variant="compact"
          />

          {/* 3. NGÀY ĐI */}
          <TourFilterCalendar
            dateValue={dateFrom}
            onSelectDate={setDateFrom}
            label="Ngày đi"
          />

          {/* 4. NGÂN SÁCH */}
          <CustomDropdown
            label="Ngân sách"
            icon={Wallet}
            options={budgetOptions}
            selectedValue={selectedBudgetValue}
            placeholder="Tất cả mức giá"
            onSelect={handleSelectBudget}
            variant="compact"
          />

          {/* 5. LOẠI TOUR (3 mục: Tất cả (mặc định), Trong nước, Nước ngoài) */}
          <div className="space-y-2 pt-1">
            <label className="text-[12px] font-extrabold uppercase tracking-wider text-slate-700">
              Loại tour
            </label>
            <div className="space-y-2">
              {TOUR_TYPE_OPTIONS.map((option) => {
                const isChecked = tourType === option.value;
                return (
                  <label
                    key={option.value}
                    onClick={() => setTourType(option.value)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg py-0.5 text-[13.5px] font-semibold text-slate-700 transition hover:text-sky-600"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => setTourType(option.value)}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-sky-500 accent-sky-500 focus:ring-sky-400"
                    />
                    <span className={isChecked ? "text-sky-700 font-bold" : ""}>
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 6. THỜI GIAN */}
          <CustomDropdown
            label="Thời gian"
            icon={Clock}
            options={DURATION_OPTIONS}
            selectedValue={duration}
            placeholder="Tất cả thời gian"
            onSelect={setDuration}
            variant="compact"
          />

          {/* Nút Áp dụng bộ lọc */}
          <button
            type="button"
            onClick={onApplyFilters}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-[13.5px] font-bold tracking-wide text-white shadow-md shadow-sky-200/80 transition-all duration-300 hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-300/80 active:scale-[0.98]"
          >
            <Search className="h-4 w-4" />
            <span>ÁP DỤNG BỘ LỌC</span>
          </button>
        </div>
      </div>

      {/* Thông báo kết quả */}
      <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-3 text-center">
        <p className="text-[12px] font-medium leading-relaxed text-sky-800">
          Tìm thấy <strong className="font-extrabold text-sky-600">{totalResults}</strong> kết quả phù hợp
        </p>
      </div>

      {/* Card Hỗ trợ / Tư vấn ở cuối sidebar */}
      <div className="rounded-2xl border border-sky-100/90 bg-[#f0f7ff] p-4.5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-md shadow-sky-200">
            <Plane className="h-5 w-5 -rotate-12" />
          </div>
          <div>
            <h3 className="text-[14px] font-extrabold text-[#123d78]">
              Bạn cần tư vấn?
            </h3>
            <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-slate-500">
              Đội ngũ JourniTrip luôn sẵn sàng hỗ trợ 24/7!
            </p>
          </div>
        </div>

        <Link
          href="/contact"
          className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-white py-2.5 text-[12.5px] font-bold text-sky-600 shadow-sm transition hover:bg-sky-50 hover:border-sky-300 active:scale-[0.98]"
        >
          <span>Liên hệ ngay</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}
