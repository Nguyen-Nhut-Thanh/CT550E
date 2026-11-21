"use client";

import FavoriteButton from "@/components/tour_cards/elements/UserFavoriteButton";
import { Tooltip } from "@/components/common/dialogs_and_feedback/dialogs/Tooltip";
import { TourCardMenu } from "@/components/tour_cards/elements/UserTourCardMenu";
import TransportIcon from "@/components/tour_cards/elements/UserTransportIcon";
import { useTourFavorite } from "@/lib/hooks/useTourFavorite";
import { getTransportLabel } from "@/lib/tours/client/display";
import { formatVND } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dateTime";
import { normalizeImageSrc } from "@/lib/utils/images";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Globe2,
  MapPin,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useId } from "react";
import type { TourRecommendationItem } from "shared";

export type RecommendedTourCardData = TourRecommendationItem;

export type RecommendedTourCardProps = {
  tour: RecommendedTourCardData;
  subtitle?: string;
  className?: string;
};

export function RecommendedTourCard({
  tour,
  subtitle = "Các hành trình đang mở bán",
  className = "",
}: RecommendedTourCardProps) {
  const id = `recommended-tour-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const personalized = tour.is_personalized === true;
  const { favorite, pending, handleFavoriteClick } = useTourFavorite(
    tour.tour_id,
    tour.name,
  );
  const imageUrl =
    normalizeImageSrc(tour.image_url) ||
    "/images/shared/default-tour-beach.jpg";
  const href = tour.link || `/tours/${tour.tour_id}`;
  const date = formatDate(tour.start_date);
  const location =
    tour.destination || tour.departure_name || "Khám phá hành trình";
  const category =
    tour.tour_type === "domestic"
      ? "Tour trong nước"
      : ["outbound", "international"].includes(tour.tour_type || "")
        ? "Tour nước ngoài"
        : "Tour du lịch";
  const discount =
    tour.price > 0 && tour.original_price && tour.original_price > tour.price
      ? Math.round((1 - tour.price / tour.original_price) * 100)
      : 0;
  const seatsLeft =
    typeof tour.seats_left === "number" && Number.isInteger(tour.seats_left) && tour.seats_left >= 0
      ? tour.seats_left
      : null;
  const tags = [
    ...new Set((tour.vibes || []).map((tag) => tag.trim()).filter(Boolean)),
  ].slice(0, 3);
  const transportType = tour.transport_type?.trim() || tour.transport_name?.trim();
  const transportLabel = transportType ? getTransportLabel(transportType) : "Đang cập nhật";
  const recommendationReason = tour.ai_reason?.replace(/^[✨✦]\s*/, "");

  const facts = [
    {
      icon: <CalendarDays className="h-3.5 w-3.5 shrink-0 text-blue-600" />,
      label: "Ngày khởi hành",
      value: date || "Đang cập nhật",
    },
    {
      icon: <Clock3 className="h-3.5 w-3.5 shrink-0 text-blue-600" />,
      label: "Thời gian",
      value: tour.duration_text || "Đang cập nhật",
    },
    {
      icon: (
        <TransportIcon
          type={transportType}
          className="h-3.5 w-3.5 shrink-0 text-blue-600"
        />
      ),
      label: "Phương tiện",
      value: transportLabel,
    },
  ];

  return (
    <article
      aria-labelledby={`${id}-title`}
      className={`group relative isolate mt-5 grid w-full min-w-0 grid-cols-1 gap-3 p-3 text-slate-800 drop-shadow-[0_10px_28px_rgba(29,78,216,0.10)] transition duration-300 before:absolute before:inset-0 before:-z-10 before:rounded-[22px] before:border before:border-blue-100 before:bg-[radial-gradient(ellipse_at_100%_20%,#e7f0ff_0%,transparent_35%),linear-gradient(135deg,#fff_40%,#f8fbff_100%)] before:content-[''] hover:-translate-y-0.5 hover:drop-shadow-[0_16px_36px_rgba(29,78,216,0.15)] motion-reduce:transform-none motion-reduce:transition-none sm:grid-cols-[34%_minmax(0,1fr)] ${className}`}
    >
      <header className="absolute -top-5 left-0 w-[228px] min-w-[204px] rounded-t-[20px] bg-white px-[13px] py-2.5 shadow-[inset_1px_1px_0_#dbeafe] sm:w-[calc((100%_-_24px)*0.34_+_14px)]">
        <p className="flex items-center gap-1.5 whitespace-nowrap text-xs font-extrabold leading-[18px] text-blue-700">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-blue-600" />
          {personalized ? "Gợi ý dành riêng cho bạn" : "Gợi ý khám phá hành trình"}
        </p>
        <p
          className="truncate pt-0.5 text-[11px] leading-4 text-slate-500"
          title={subtitle}
        >
          {subtitle}
        </p>
      </header>

      <figure className="relative isolate mt-7 h-[180px] sm:h-auto sm:min-h-[220px]">
        {/* SVG giữ đường cong theo từng instance; mọi kiểu dáng dùng class Tailwind. */}
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <clipPath id={`${id}-photo`} clipPathUnits="objectBoundingBox">
              <path d="M .06 0 L .90 0 Q .97 0 .98 .06 C 1 .28 .99 .68 .95 .88 C .93 .96 .84 .98 .68 .97 C .45 .95 .22 .98 .06 .99 Q 0 .99 0 .93 L 0 .06 Q 0 0 .06 0 Z" />
            </clipPath>
            <clipPath id={`${id}-back`} clipPathUnits="objectBoundingBox">
              <path d="M .06 0 L .91 0 Q .98 0 .99 .06 C 1.01 .32 1 .74 .96 .93 C .94 .99 .85 1 .65 .99 L .06 1 Q 0 1 0 .94 L 0 .06 Q 0 0 .06 0 Z" />
            </clipPath>
            <linearGradient id={`${id}-back-fill`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#e0f2fe" />
              <stop offset=".5" stopColor="#dbeafe" stopOpacity=".8" />
              <stop offset="1" stopColor="#bae6fd" stopOpacity=".7" />
            </linearGradient>
            <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
              <stop offset=".45" stopColor="#0f172a" stopOpacity="0" />
              <stop offset=".7" stopColor="#0f172a" stopOpacity=".15" />
              <stop offset="1" stopColor="#0f172a" stopOpacity=".5" />
            </linearGradient>
          </defs>
          <rect
            width="100%"
            height="100%"
            transform="translate(3 3)"
            fill={`url(#${id}-back-fill)`}
            clipPath={`url(#${id}-back)`}
          />
          <rect
            width="100%"
            height="100%"
            className="fill-sky-100"
            clipPath={`url(#${id}-photo)`}
          />
          <image
            href={imageUrl}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${id}-photo)`}
          />
          <rect
            width="100%"
            height="100%"
            fill={`url(#${id}-shade)`}
            clipPath={`url(#${id}-photo)`}
          />
        </svg>
        <Link
          href={href}
          aria-label={`Xem tour ${tour.name}`}
          className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        />
        <span className="pointer-events-none absolute left-3.5 top-3.5 max-w-[calc(100%_-_70px)] truncate rounded-full bg-[#2563eb]/65 px-2.5 py-1 text-[10px] font-semibold leading-4 text-white shadow-md shadow-blue-950/20 backdrop-blur-lg">
          {personalized ? "Tour theo hoạt động của bạn" : "Hành trình đang mở bán"}
        </span>
        <FavoriteButton
          active={favorite}
          loading={pending}
          onClick={handleFavoriteClick}
          label={favorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          iconClassName="h-4 w-4"
          className={`absolute right-3.5 top-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/65 shadow-md ring-2 ring-white/40 backdrop-blur-lg transition hover:scale-105 hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 ${favorite ? "text-red-500" : "text-slate-500"}`}
        />
        <figcaption className="pointer-events-none absolute bottom-5 left-4 inline-flex max-w-[calc(100%_-_30px)] items-center gap-1.5 rounded-full border border-white/15 bg-slate-900/50 px-3.5 py-1.5 text-xs font-medium leading-4 text-white backdrop-blur-md">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{location}</span>
        </figcaption>
      </figure>

      <div className="flex min-w-0 flex-col gap-2 sm:gap-1.5">
        <div className="flex min-h-[22px] flex-wrap items-center gap-1.5 sm:pr-8">
          <span className="inline-flex items-center gap-1 rounded-full bg-[linear-gradient(90deg,#4F7CF6_0%,#8B5CF6_52%,#F58856_100%)] px-[9px] py-[3px] text-[10px] font-bold leading-4 text-white">
            <Target className="h-3 w-3" />
            Gợi ý cho bạn
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-[9px] py-[3px] text-[10px] font-bold leading-4 text-blue-700 ring-1 ring-inset ring-blue-100">
            <Globe2 className="h-3 w-3" />
            {category}
          </span>
        </div>
        <div className="absolute right-2.5 top-[9px] z-30">
          <TourCardMenu
            tour={{
              tour_id: tour.tour_id,
              name: tour.name,
              code: tour.code,
              image_url: imageUrl,
              price: tour.price,
              duration: tour.duration_text,
              departure: tour.departure_name,
            }}
          />
        </div>
        <h3
          id={`${id}-title`}
          className="h-10 line-clamp-2 text-[15px] font-extrabold leading-5 tracking-[-.25px] text-[#183567]"
          title={tour.name}
        >
          <Link
            href={href}
            className="rounded focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            {tour.name}
          </Link>
        </h3>
        {tour.summary?.trim() && (
          <p
            className="line-clamp-1 text-xs leading-4 text-slate-500"
            title={tour.summary}
          >
            {tour.summary}
          </p>
        )}
        <div className="min-h-5 shrink-0">
          {tags.length > 0 && (
            <ul
              className="flex flex-wrap gap-1.5"
              aria-label="Trải nghiệm nổi bật"
            >
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-slate-100 px-2 py-[3px] text-[10px] font-medium leading-[14px] text-slate-500"
                >
                  #{tag.replace(/^#+/, "")}
                </li>
              ))}
            </ul>
          )}
        </div>
        {recommendationReason && (
          <Tooltip
            portal
            className="min-w-0"
            content={<p className="whitespace-normal break-words text-xs leading-5 text-slate-700">{recommendationReason}</p>}
            trigger={
              <button type="button" className="flex w-full min-w-0 items-center gap-1.5 rounded-lg border border-blue-100/80 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-sky-50/80 px-2.5 py-1 text-left text-[11px] font-medium leading-4 text-blue-950 shadow-2xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                <span className="min-w-0 truncate">{recommendationReason}</span>
              </button>
            }
          />
        )}
        <dl className="grid grid-cols-3 divide-x divide-blue-100 rounded-xl bg-blue-50/70 px-1 py-1.5 max-[359px]:grid-cols-1 max-[359px]:divide-x-0 max-[359px]:divide-y">
          {facts.map(({ icon, label, value }) => (
            <div
              key={label}
              className="flex min-w-0 items-center gap-1 px-1 sm:gap-1.5 sm:px-1.5 max-[359px]:py-1.5"
            >
              {icon}
              <div className="min-w-0 max-[359px]:flex max-[359px]:flex-1 max-[359px]:items-center max-[359px]:justify-between max-[359px]:gap-2">
                <dt className="text-[10px] font-medium leading-[14px] text-slate-500">
                  {label}
                </dt>
                <dd
                  className="truncate text-[11px] font-bold leading-4 text-slate-800"
                  title={value}
                >
                  {value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] leading-[18px] text-slate-500">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {tour.rating_count > 0 ? (
            <>
              <strong className="font-bold text-slate-800">
                {Number(tour.rating_avg || 0).toFixed(1)}
              </strong>
              <span>({tour.rating_count} đánh giá)</span>
            </>
          ) : (
            <span>Chưa có đánh giá</span>
          )}
          {seatsLeft !== null && (
            <>
              <span aria-hidden="true" className="px-px text-slate-400">
                ·
              </span>
              <span>Còn lại: {seatsLeft} chỗ</span>
            </>
          )}
        </div>
        <footer className="mt-auto flex flex-wrap items-end justify-between gap-2 border-t border-blue-100/80 pt-2 max-sm:gap-2.5 max-sm:pt-2.5">
          <p className="max-sm:flex-[1_0_54%]">
            {discount > 0 && (
              <del className="mb-0.5 block text-[10px] font-semibold leading-[14px] text-slate-400">
                {formatVND(tour.original_price)}
              </del>
            )}
            <span className="whitespace-nowrap text-base font-extrabold leading-5 tracking-[-.3px] text-blue-700">
              {tour.price > 0 ? formatVND(tour.price) : "Liên hệ"}
              {tour.price > 0 && (
                <span className="text-[10px] font-normal tracking-normal text-slate-400">
                  {" "}
                  / người
                </span>
              )}
            </span>
          </p>
          {discount > 0 && (
            <span className="whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold leading-4 text-blue-700 max-sm:ml-auto">
              Tiết kiệm {discount}%
            </span>
          )}
          <Link
            href={tour.booking_link || href}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-3.5 py-2 text-xs font-bold leading-5 text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[.98] motion-reduce:transform-none motion-reduce:transition-none max-sm:w-full"
          >
            Đặt ngay
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </footer>
      </div>
    </article>
  );
}
