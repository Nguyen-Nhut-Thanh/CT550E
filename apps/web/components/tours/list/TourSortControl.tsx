"use client";

import CustomDropdown from "@/components/common/CustomDropdown";

type TourSortControlProps = {
  totalResults: number;
  sortBy: string;
  setSortBy: (val: string) => void;
  showBestsellerOption?: boolean;
};

export default function TourSortControl({
  totalResults,
  sortBy,
  setSortBy,
  showBestsellerOption = false,
}: TourSortControlProps) {
  const sortOptions = [
    ...(showBestsellerOption
      ? [{ label: "Bán chạy nhất", value: "bestseller" }]
      : []),
    { label: "Ngày khởi hành gần nhất", value: "nearest" },
    { label: "Giá: Thấp đến Cao", value: "price-asc" },
    { label: "Giá: Cao đến Thấp", value: "price-desc" },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] md:flex-row md:items-center md:justify-between">
      <div className="text-[15px] font-medium text-gray-500">
        Chúng tôi tìm thấy{" "}
        <span className="font-bold text-sky-600">{totalResults}</span>{" "}
        chương trình tour
      </div>

      <div className="flex items-center gap-3">
        <span className="shrink-0 text-[14px] font-medium text-gray-400">
          Sắp xếp:
        </span>
        <CustomDropdown
          options={sortOptions}
          selectedValue={sortBy}
          onSelect={setSortBy}
          variant="compact"
          placeholder="Chọn kiểu sắp xếp"
        />
      </div>
    </div>
  );
}
