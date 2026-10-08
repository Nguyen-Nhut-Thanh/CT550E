"use client";

import { Bus, Hotel, Utensils, UserCheck, ShieldCheck, Droplet, Sparkles } from "lucide-react";

const AMENITIES = [
  { icon: Bus, label: "Xe đưa đón đời mới" },
  { icon: Hotel, label: "Khách sạn 4 sao" },
  { icon: Utensils, label: "Ăn uống đa dạng" },
  { icon: UserCheck, label: "Hướng dẫn viên chuyên nghiệp" },
  { icon: ShieldCheck, label: "Bảo hiểm du lịch" },
  { icon: Droplet, label: "Nước suối mỗi ngày" },
];

export default function TourAmenities() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
          <Sparkles className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Tiện ích nổi bật</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {AMENITIES.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-sky-200 hover:bg-white hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100/80 text-sky-600">
                <IconComponent className="h-5 w-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
