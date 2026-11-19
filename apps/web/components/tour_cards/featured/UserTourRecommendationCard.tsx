"use client";

import {
  CalendarDays,
  ArrowRight,
  MapPin,
  BusFront,
  Utensils,
  BedDouble,
  Star,
  Flame,
  ImageIcon,
} from "lucide-react";
import FavoriteButton from "@/components/tour_cards/elements/UserFavoriteButton";

export type TourRecommendationData = {
  id: number;
  title: string;
  url: string;
  image_url?: string;
  price?: number;
  duration?: string;
  schedule_id?: number;
  departure_date?: string;
  original_price?: number;
  summary?: string;
  destination?: string;
  transport?: string;
  meals?: string;
  hotel?: string;
  rating?: number;
  rating_count?: number;
  category?: string;
};

export type TourRecommendationCardProps = {
  tour: TourRecommendationData;
  favorite?: boolean;
  favoritePending?: boolean;
  onToggleFavorite?: () => void;
  error?: string;
};

/** Hiển thị khung giới thiệu tour dùng chung cho chat hỗ trợ và chatbot. */
export function TourRecommendationCard({
  tour: context,
  favorite = false,
  favoritePending = false,
  onToggleFavorite,
  error,
}: TourRecommendationCardProps) {
  const href = context.schedule_id
    ? `${context.url}?scheduleId=${context.schedule_id}`
    : context.url;

  const discount =
    context.original_price &&
    context.price !== undefined &&
    context.original_price > context.price
      ? Math.round((1 - context.price / context.original_price) * 100)
      : 0;

  const services = [
    {
      icon: BusFront,
      label: "Di chuyển",
      value: context.transport || "Theo lịch trình",
    },
    {
      icon: Utensils,
      label: "Ăn uống",
      value: context.meals || "Xem chi tiết",
    },
    {
      icon: BedDouble,
      label: "Khách sạn",
      value: context.hotel || "Xem chi tiết",
    },
  ];

  return (
    <article className="w-full min-w-0 max-w-[420px] text-[#17264f]">
      <div className="relative flex overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_6px_20px_-6px_#bad7ff] transition hover:shadow-md">
        {/* Cột trái: Ảnh bìa tour */}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Xem tour ${context.title}`}
          className="relative w-[38%] min-w-[125px] max-w-[155px] shrink-0 overflow-hidden bg-blue-50"
        >
          {context.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={context.image_url}
              alt={context.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-blue-200">
              <ImageIcon size={32} />
            </div>
          )}

          {/* Huy hiệu HOT */}
          {discount > 0 && (
            <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-[#ff5575] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
              <Flame size={11} fill="currentColor" />
              HOT
            </span>
          )}

          {/* Lớp phủ chân ảnh: Điểm đến & Đánh giá */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-2 text-white">
            {context.destination && (
              <span className="flex items-center gap-0.5 truncate text-[10px] font-semibold">
                <MapPin size={11} className="shrink-0" />
                <span className="truncate">{context.destination}</span>
              </span>
            )}
            {!!context.rating_count && context.rating !== undefined && (
              <span className="ml-auto flex shrink-0 items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-slate-800 shadow-xs">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <span>{context.rating.toFixed(1)}</span>
              </span>
            )}
          </div>
        </a>

        {/* Cột phải: Nội dung chi tiết tour */}
        <div className="relative flex min-w-0 flex-1 flex-col justify-between p-2.5 sm:p-3">
          {/* Header thẻ: Danh mục & Nút yêu thích */}
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#deebff] px-2 py-0.5 text-[10px] font-bold text-[#1475ff]">
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">{context.category || "Khám phá tour"}</span>
              </span>
              {onToggleFavorite && (
                <FavoriteButton
                  active={favorite}
                  loading={favoritePending}
                  onClick={onToggleFavorite}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0f1ff] text-[#2d4377] transition hover:bg-blue-100 cursor-pointer"
                  iconClassName="h-3 w-3"
                  label={favorite ? "Bỏ tour khỏi yêu thích" : "Lưu tour yêu thích"}
                />
              )}
            </div>

            {/* Tên tour */}
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 line-clamp-2 block text-xs sm:text-[13px] font-extrabold leading-snug tracking-tight text-[#17264f] hover:text-blue-600 transition-colors"
            >
              {context.title}
            </a>

            {/* Thời lượng & Ngày khởi hành */}
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-[#7890b6]">
              {context.duration && (
                <span className="flex items-center gap-1">
                  <CalendarDays size={11} className="text-[#5279b6] shrink-0" />
                  <span>{context.duration}</span>
                </span>
              )}
              {context.departure_date && (
                <span className="flex items-center gap-1 border-l border-blue-200 pl-2">
                  <MapPin size={11} className="text-[#5279b6] shrink-0" />
                  <span>
                    Khởi hành:{" "}
                    {new Date(context.departure_date).toLocaleDateString("vi-VN", {
                      timeZone: "Asia/Ho_Chi_Minh",
                    })}
                  </span>
                </span>
              )}
            </div>

            {/* Tiện ích tour */}
            <div className="mt-1.5 grid grid-cols-3 rounded-lg bg-[#f1f8ff] p-1 text-[10px] text-[#4167a5]">
              {services.map(({ icon: Icon, label, value }, index) => (
                <div
                  key={label}
                  className={`flex items-center gap-1 min-w-0 ${
                    index ? "border-l border-[#b9d1f4] pl-1.5" : "pl-0.5"
                  }`}
                >
                  <Icon size={11} className="shrink-0 text-blue-600" />
                  <div className="min-w-0">
                    <p className="truncate text-[9px] text-[#7186ac] leading-none">{label}</p>
                    <p className="truncate font-semibold leading-tight text-[10px]" title={value}>
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chân thẻ: Giá & Nút xem chi tiết */}
          <div className="mt-2 flex items-center justify-between gap-1.5 border-t border-slate-100 pt-1.5">
            <div className="min-w-0">
              {context.price !== undefined && (
                <p className="text-sm font-extrabold tracking-tight text-[#ff375f] leading-none">
                  {context.price.toLocaleString("vi-VN")} đ
                </p>
              )}
              {discount > 0 && context.original_price && (
                <div className="mt-0.5 flex items-center gap-1 text-[10px] leading-none">
                  <span className="text-[#a7b9d7] line-through text-[9px]">
                    {context.original_price.toLocaleString("vi-VN")} đ
                  </span>
                  <span className="rounded-full bg-[#ff6685] px-1 py-0.2 text-[9px] font-bold text-white">
                    -{discount}%
                  </span>
                </div>
              )}
            </div>

            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-[#1475ff] px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition hover:bg-blue-600 active:scale-95"
            >
              <span>Xem chi tiết</span>
              <ArrowRight size={11} />
            </a>
          </div>

          {error && (
            <p role="alert" className="mt-1 text-[10px] text-rose-500">
              {error}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
