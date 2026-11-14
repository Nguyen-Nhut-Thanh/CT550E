"use client";

import { Star } from "lucide-react";

/** Hiển thị số sao tương ứng với điểm đánh giá. */
export function StarRating({
  rating,
  size = "h-4 w-4",
}: {
  rating: number;
  size?: string;
}) {
  const normalizedRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className="flex items-center gap-0.5" aria-label={`${normalizedRating}/5 sao`}>
      {Array.from({ length: 5 }, (_, index) => {
        const fillPercent = Math.max(0, Math.min(1, normalizedRating - index)) * 100;

        return (
          <span key={index} className={`relative inline-block shrink-0 ${size}`}>
            <Star className={`absolute inset-0 ${size} fill-slate-100 text-slate-200`} strokeWidth={1.8} />
            <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
              <Star className={`max-w-none ${size} fill-amber-400 text-amber-400`} strokeWidth={1.8} />
            </span>
          </span>
        );
      })}
    </div>
  );
}
