"use client";

import FavoriteButton from "@/components/tour_cards/elements/UserFavoriteButton";
import TransportIcon from "@/components/tour_cards/elements/UserTransportIcon";
import { useTourFavorite } from "@/lib/hooks/useTourFavorite";
import { getTransportLabel } from "@/lib/tours/client/display";
import { formatVND } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dateTime";
import { normalizeImageSrc } from "@/lib/utils/images";
import { Calendar, Hash, Hotel } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { FeaturedTourCardProps } from 'shared';

const PLACEHOLDER_IMAGE =
  "/images/shared/default-tour-beach.jpg";

export default function FeaturedTourCard({ item }: FeaturedTourCardProps) {
  const { favorite, pending, handleFavoriteClick } = useTourFavorite(item.tour_id, item.name);

  const imageUrl =
    normalizeImageSrc(item.cover_image_url || item.image_url) ||
    PLACEHOLDER_IMAGE;

  return (
    <div className="group block h-[250px] w-full bg-transparent [perspective:1200px]">
      <div className="relative h-full w-full rounded-[18px] transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Mặt trước của Card */}
        <div className="absolute inset-0 flex h-full w-full flex-col justify-between overflow-hidden rounded-[18px] border border-white/70 bg-white p-5 text-left shadow-[0_14px_34px_rgba(15,23,42,0.10)] [backface-visibility:hidden]">
          <Link
            href={item.link || `/tours/${item.tour_id}`}
            className="absolute inset-0 z-0"
            aria-label={item.route_text || item.name}
          />

          <div className="relative z-10 flex items-start justify-between gap-3 pointer-events-none">
            <h3 className="truncate text-[15px] font-extrabold uppercase tracking-tight text-slate-900">
              {item.route_text}
            </h3>

            <div className="pointer-events-auto">
              <FavoriteButton
                active={favorite}
                loading={pending}
                onClick={handleFavoriteClick}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-colors ${
                  favorite
                    ? "bg-rose-500 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500"
                }`}
                iconClassName="h-4.5 w-4.5"
                label={
                  favorite
                    ? "Bỏ khỏi yêu thích"
                    : "Thêm vào yêu thích"
                }
              />
            </div>
          </div>

          <div className="relative z-10 pointer-events-none space-y-3 text-[14px] text-slate-700">
            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <Hash className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="shrink-0 font-semibold text-slate-800">Mã:</span>
              <span className="truncate">{item.code}</span>
            </div>

            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="shrink-0 font-semibold text-slate-800">
                Khởi hành:
              </span>
              <span className="truncate">{formatDate(item.start_date)}</span>
            </div>

            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <Hotel className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="shrink-0 font-semibold text-slate-800">
                Khách sạn:
              </span>
              <span className="truncate">{item.hotel_name || "Tiêu chuẩn"}</span>
            </div>

            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <TransportIcon
                type={item.transport_type}
                className="h-4 w-4 shrink-0 text-slate-400"
              />
              <span className="shrink-0 font-semibold text-slate-800">
                Phương tiện:
              </span>
              <span className="truncate">
                {item.transport_type
                  ? getTransportLabel(item.transport_type)
                  : "Đang cập nhật"}
              </span>
            </div>
          </div>

          <div className="relative z-10 pointer-events-none flex items-end justify-between gap-3 pt-3">
            <div className="ml-auto text-right">
              <p className="text-[13px] font-semibold text-slate-700">Giá từ</p>
              <p className="text-[16px] font-black text-red-600 sm:text-[18px]">
                {formatVND(item.price)}
                <span className="ml-1 text-slate-800">/ khách</span>
              </p>
            </div>
          </div>
        </div>

        {/* Mặt sau của Card (khi lật 3D - theo thiết kế Hình 2) */}
        <div className="absolute inset-0 flex flex-col justify-end overflow-hidden rounded-[18px] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />

          {/* Lớp phủ dốc tối để làm nổi bật thông tin và nút ở dưới đáy */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />

          {/* Link toàn card để click vào vùng ảnh vẫn mở chi tiết tour */}
          <Link
            href={item.link || `/tours/${item.tour_id}`}
            className="absolute inset-0 z-0"
            aria-label={item.name}
          />

          {/* Nội dung thông tin & hành động ở dưới đáy mặt sau */}
          <div className="relative z-10 p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-white/90">
              KHÁM PHÁ TOUR
            </span>

            <h3 className="mt-1 truncate text-base font-bold text-white sm:text-[17px]">
              {item.name}
            </h3>

            {/* Đường gạch ngang phân cách */}
            <div className="my-2.5 h-px w-full bg-white/20" />

            {/* Hàng hành động: Xem chi tiết & Đặt ngay */}
            <div className="flex items-center justify-between">
              <Link
                href={item.link || `/tours/${item.tour_id}`}
                className="text-xs font-semibold text-white/95 transition-colors hover:text-white hover:underline sm:text-sm"
              >
                Xem chi tiết
              </Link>

              <Link
                href={`/booking?tourId=${item.tour_id}${item.schedule_id ? `&scheduleId=${item.schedule_id}` : ""}`}
                className="inline-flex items-center justify-center rounded-full bg-neutral-800/85 px-4 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md transition-all hover:bg-neutral-900 hover:shadow-md active:scale-95 border border-white/10 sm:text-sm"
              >
                Đặt ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
