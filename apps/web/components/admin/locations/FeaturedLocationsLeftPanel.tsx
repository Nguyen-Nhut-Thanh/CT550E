"use client";

import { Check, LayoutGrid, MapPin } from "lucide-react";
import type { AdminLocationItem } from "shared";
import { FeaturedLocationsGrid } from "./FeaturedLocationsGrid";

export function FeaturedLocationsLeftPanel({
  allChildren,
  featured,
  onToggleSelect,
}: {
  allChildren: AdminLocationItem[];
  featured: AdminLocationItem[];
  onToggleSelect: (location: AdminLocationItem) => void;
}) {
  return (
    <div className="space-y-6 lg:col-span-4">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-5">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900">
            <MapPin size={16} className="text-blue-500" />
            Địa điểm con
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {allChildren.length} mục
          </span>
        </div>

        <div className="custom-scrollbar max-h-[550px] space-y-2 overflow-y-auto p-4">
          {allChildren.length === 0 ? (
            <div className="py-10 text-center text-xs italic text-slate-300">
              Không có địa điểm con nào thuộc vùng này
            </div>
          ) : (
            allChildren.map((location) => {
              const isSelected = featured.some((item) => item.location_id === location.location_id);

              return (
                <div
                  key={location.location_id}
                  onClick={() => onToggleSelect(location)}
                  className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                    isSelected ? "border-blue-200 bg-blue-50" : "border-slate-100 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "border border-slate-100 bg-slate-50 text-slate-400"
                      }`}
                    >
                      {isSelected ? <Check size={16} /> : <MapPin size={16} />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                        {location.name}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400">
                        {location.geographic_levels?.name || "Không rõ cấp độ"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-900">
          <LayoutGrid size={14} className="text-blue-500" />
          Mô phỏng vị trí (9 ô)
        </h3>
        <FeaturedLocationsGrid items={featured} />
        <p className="mt-4 text-center text-[9px] font-medium italic text-slate-400">
          * Vị trí 1 và 6 hiển thị kích thước lớn trên trang chủ.
        </p>
      </div>
    </div>
  );
}
