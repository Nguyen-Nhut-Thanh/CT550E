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
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating}/5 sao`}>
      {Array.from({ length: 5 }, (_, index) => {
        const active = index < Math.round(rating);

        return (
          <Star
            key={index}
            className={`${size} ${
              active
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-100 text-slate-200"
            }`}
            strokeWidth={1.8}
          />
        );
      })}
    </div>
  );
}
