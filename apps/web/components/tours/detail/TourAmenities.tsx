"use client";

import { Bus, CloudSun, Droplet, Hotel, ShieldCheck, Sparkles, Ticket, UserCheck, Users, Utensils, X } from 'lucide-react';
import { useId, useState } from 'react';
import type { TourAmenity, TourSchedule } from 'shared';
import { Dialog } from '@/components/common/overlays/Dialog';
import { getTourAmenities } from '@/lib/tours/amenities';

const ICONS = { transport: Bus, hotel: Hotel, cuisine: Utensils, guide: UserCheck, insurance: ShieldCheck, water: Droplet, best_time: CloudSun, best_for: Users, promotion: Ticket };

export default function TourAmenities({ amenities, schedule }: { amenities: TourAmenity[]; schedule?: TourSchedule | null }) {
  const [selected, setSelected] = useState<string | null>(null);
  const headingId = useId();
  const items = getTourAmenities(amenities, schedule);
  const active = items.find(item => item.kind === selected);
  if (!items.length) return null;

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600"><Sparkles className="h-4 w-4" /></div>
        <h2 className="text-xl font-bold text-slate-900">Tiện ích nổi bật</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map(item => {
          const Icon = ICONS[item.kind] || Sparkles;
          return (
            <button key={item.kind} type="button" aria-haspopup="dialog" onClick={() => setSelected(item.kind)}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-left transition hover:border-sky-200 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100/80 text-sky-600"><Icon className="h-5 w-5" /></span>
              <span className="text-xs font-bold leading-tight text-slate-800 sm:text-sm">{item.title}</span>
            </button>
          );
        })}
      </div>
      {active && <Dialog labelledBy={headingId} onClose={() => setSelected(null)}>
        <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <h3 id={headingId} className="text-xl font-bold text-slate-900">{active.title}</h3>
            <button type="button" aria-label="Đóng thông tin tiện ích" onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
          </div>
          {schedule && <p className="mt-2 text-sm text-sky-700">Chuyến khởi hành {new Date(schedule.start_date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>}
          <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{active.content || 'Thông tin chi tiết đang được cập nhật cho chuyến đi này.'}</p>
        </div>
      </Dialog>}
    </section>
  );
}
