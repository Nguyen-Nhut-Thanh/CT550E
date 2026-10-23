"use client";

import { LocationSelectField } from "@/components/admin/locations/LocationSelectField";

import { getLocationHierarchyPreview } from "@/lib/admin/locations/hierarchy";
import { ChevronRight, MapPin } from "lucide-react";
import type { LocationHierarchyCardProps as Props } from 'shared';

export function LocationHierarchyCard(props: Props) {
  const preview = getLocationHierarchyPreview(props);

  return (
    <div className="animate-in zoom-in-95 overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm fade-in duration-500">
      <div className="flex items-center gap-3 border-b border-slate-50 bg-slate-50/30 p-6">
        <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
          <MapPin size={18} />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Xác định chuỗi địa điểm cha</h3>
      </div>
      <div className="space-y-6 p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <LocationSelectField
            label="1. Quốc gia (Cấp 3)"
            value={props.level3Id}
            options={props.level3List}
            loading={props.loadingL3}
            placeholder="-- Chọn quốc gia --"
            onChange={props.onLevel3Change}
          />

          {props.form.level_id > 4 && (
            <div className="animate-in slide-in-from-left-2 fade-in">
              <LocationSelectField
                label="2. Miền (Cấp 4)"
                value={props.level4Id}
                options={props.level4List}
                disabled={!props.level3Id}
                loading={props.loadingL4}
                placeholder="-- Chọn vùng / miền --"
                onChange={props.onLevel4Change}
              />
            </div>
          )}

          {props.form.level_id > 5 && (
            <div className="animate-in slide-in-from-left-2 fade-in">
              <LocationSelectField
                label="3. Tỉnh / Thành phố (Cấp 5)"
                value={props.level5Id}
                options={props.level5List}
                disabled={!props.level4Id}
                loading={props.loadingL5}
                placeholder="-- Chọn tỉnh / thành phố --"
                onChange={props.onLevel5Change}
              />
            </div>
          )}

        </div>

        <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-xl shadow-slate-200">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="group flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-slate-500 transition-colors group-hover:bg-white" />
              <span className="text-[11px] font-bold text-slate-400 transition-colors group-hover:text-white">
                Toàn cầu
              </span>
            </div>

            <ChevronRight size={12} className="text-slate-600" />
            <span className={`text-[11px] font-black ${props.level3Id ? "text-blue-400" : "text-slate-600"}`}>
              {preview.level3}
            </span>

            {props.form.level_id >= 4 && (
              <>
                <ChevronRight size={12} className="text-slate-600" />
                <span className={`text-[11px] font-black ${props.level4Id ? "text-emerald-400" : "text-slate-600"}`}>
                  {preview.level4}
                </span>
              </>
            )}

            {props.form.level_id >= 5 && (
              <>
                <ChevronRight size={12} className="text-slate-600" />
                <span className={`text-[11px] font-black ${props.level5Id ? "text-amber-400" : "text-slate-600"}`}>
                  {preview.level5}
                </span>
              </>
            )}

            {props.form.level_id === 6 && (
              <>
                <ChevronRight size={12} className="text-slate-600" />
                <span className="text-[11px] font-black italic text-rose-400">{preview.level6}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
