"use client";

import type { ReviewItem } from "shared";

export function ReviewAvatar({ review }: { review: ReviewItem }) {
  if (review.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={review.avatarUrl}
        alt={review.name}
        className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
      />
    );
  }

  const initials = review.name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((item) => item.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-black text-sky-700 ring-2 ring-white shadow-sm">
      {initials}
    </div>
  );
}
