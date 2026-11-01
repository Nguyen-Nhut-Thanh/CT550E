"use client";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { LocationOption } from 'shared';

export function TourRouteOrder({ ids, locations, disabled = false, onChange }: {
  ids: number[]; locations: LocationOption[]; disabled?: boolean; onChange: (ids: number[]) => void;
}) {
  const move = (index: number, offset: number) => {
    const next = [...ids];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  };
  if (!ids.length) return null;
  return <div className="space-y-2"><p className="text-xs text-slate-500">Thứ tự tỉnh/thành trong hành trình</p><ol className="flex flex-wrap gap-2">
    {ids.map((id, index) => <li key={id} className="flex items-center gap-1 rounded-xl border border-blue-100 bg-blue-50 px-2 py-1.5 text-xs text-blue-800">
      <span className="px-1 font-semibold">{index + 1}. {locations.find(item => item.location_id === id)?.name || `#${id}`}</span>
      <button type="button" aria-label={`Đưa ${locations.find(item => item.location_id === id)?.name} lên trước`} disabled={disabled || index === 0} onClick={() => move(index, -1)} className="rounded p-1 hover:bg-blue-100 disabled:opacity-25"><ArrowLeft size={14} /></button>
      <button type="button" aria-label={`Đưa ${locations.find(item => item.location_id === id)?.name} ra sau`} disabled={disabled || index === ids.length - 1} onClick={() => move(index, 1)} className="rounded p-1 hover:bg-blue-100 disabled:opacity-25"><ArrowRight size={14} /></button>
    </li>)}
  </ol></div>;
}
