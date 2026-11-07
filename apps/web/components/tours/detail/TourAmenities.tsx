"use client";

import { Bus, ChevronDown, CloudSun, Droplet, Hotel, ShieldCheck, Sparkles, Ticket, UserCheck, Users, Utensils } from 'lucide-react';
import type { TourAmenity, TourSchedule } from 'shared';
import { getTourAmenities } from '@/lib/tours/amenities';

const ICONS = { transport: Bus, hotel: Hotel, cuisine: Utensils, guide: UserCheck, insurance: ShieldCheck, water: Droplet, best_time: CloudSun, best_for: Users, promotion: Ticket };

export default function TourAmenities({ amenities, schedule }: { amenities: TourAmenity[]; schedule?: TourSchedule | null }) {
  const items = getTourAmenities(amenities, schedule);
  if (!items.length) return null;

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600"><Sparkles className="h-4 w-4" /></div>
        <h2 className="text-xl font-bold text-slate-900">Tiện ích nổi bật</h2>
      </div>
      <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3">
        {items.map(item => {
          const Icon = ICONS[item.kind] || Sparkles;
          return (
            <details key={item.kind} className="group min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70 transition open:border-sky-200 open:bg-white hover:border-sky-200 hover:shadow-sm">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 [&::-webkit-details-marker]:hidden">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100/80 text-sky-600"><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1 break-words text-xs font-bold leading-tight text-slate-800 sm:text-sm">{item.title}</span>
                <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-slate-100 p-3.5">
                {schedule && <p className="mb-2 text-xs text-sky-700">Chuyến khởi hành {new Date(schedule.start_date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>}
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{item.content || 'Thông tin chi tiết đang được cập nhật cho chuyến đi này.'}</p>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
