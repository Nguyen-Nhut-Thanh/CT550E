"use client";

import { Heart, Loader2 } from "lucide-react";
import type { FavoriteButtonProps } from 'shared';

/** Hiển thị nút thêm hoặc bỏ mục yêu thích và trạng thái đang xử lý. */
export default function FavoriteButton({
  active,
  loading = false,
  onClick,
  className = "",
  iconClassName = "",
  label,
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-pressed={active}
      aria-label={label || (active ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích")}
      className={className}
    >
      {loading ? (
        <Loader2 className={`animate-spin ${iconClassName}`} />
      ) : (
        <Heart
          className={iconClassName}
          fill={active ? "currentColor" : "none"}
        />
      )}
    </button>
  );
}
