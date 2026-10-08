"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Share2, Star, MapPin, X, ChevronLeft, ChevronRight, Check, Image as ImageIcon } from "lucide-react";
import type { PublicTourDetail } from "shared";
import FavoriteButton from "@/components/common/FavoriteButton";
import { useFavoriteTours } from "@/lib/client/hooks/useFavoriteTours";
import { useToast } from "@/components/common/Toast";
import { useRouter } from "next/navigation";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200";

type TourDetailHeroProps = {
  tour: PublicTourDetail;
};

export default function TourDetailHero({ tour }: TourDetailHeroProps) {
  const router = useRouter();
  const toast = useToast();
  const { isFavorite, isPending, toggleFavorite } = useFavoriteTours();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  const images =
    tour.tour_images && tour.tour_images.length > 0
      ? tour.tour_images.map((img) => img.image_url)
      : [PLACEHOLDER_IMAGE];

  const mainImage = images[activeImageIndex] || images[0];

  const handleFavoriteClick = async () => {
    const result = await toggleFavorite(tour.tour_id);
    if (!result.ok) {
      if (result.reason === "unauthenticated") {
        toast.info(result.message);
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      toast.error(result.message);
      return;
    }
    toast.success(
      result.action === "added"
        ? `Đã thêm "${tour.name}" vào tour yêu thích.`
        : `Đã bỏ "${tour.name}" khỏi tour yêu thích.`
    );
  };

  const handleShareClick = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Đã chép liên kết tour vào bộ nhớ tạm!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const departureName = tour.departure_locations?.name || "Hồ Chí Minh";
  const tourCategory = tour.tour_type || "Tour Miền Tây";

  const scrollThumbnails = (direction: "left" | "right") => {
    thumbnailScrollRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
        <Link href="/" className="hover:text-sky-600 transition">Trang chủ</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <Link href="/tours" className="hover:text-sky-600 transition">Tour</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-600 font-medium">{tourCategory}</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="truncate font-bold text-slate-900 max-w-[200px] sm:max-w-xs">{tour.name}</span>
      </nav>

      {/* Title & Metadata Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl leading-snug">
            {tour.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <span className="rounded-full bg-sky-50 px-3 py-1 font-bold text-sky-700 border border-sky-100">
              {tourCategory}
            </span>

            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{Number(tour.rating_avg) ? Number(tour.rating_avg).toFixed(1) : "5.0"}</span>
              <span className="text-slate-400 font-normal">
                ({tour.rating_count ?? (tour.reviews ? tour.reviews.length : 0)} đánh giá)
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-600">
              <MapPin className="h-4 w-4 text-sky-600" />
              <span>Khởi hành từ: <strong className="text-slate-800">{departureName}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Yêu thích & Chia sẻ */}
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <FavoriteButton
            active={isFavorite(tour.tour_id)}
            loading={isPending(tour.tour_id)}
            onClick={handleFavoriteClick}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow-sm ${
              isFavorite(tour.tour_id)
                ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
            iconClassName="h-4 w-4"
            label="Yêu thích"
          />

          <button
            type="button"
            onClick={handleShareClick}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4 text-slate-500" />}
            <span>{copied ? "Đã chép" : "Chia sẻ"}</span>
          </button>
        </div>
      </div>

      {/* Media Gallery Section */}
      <div className="space-y-3">
        {/* Featured Main Image Container */}
        <div
          onClick={() => setIsGalleryModalOpen(true)}
          className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-lg group cursor-pointer"
        >
          <Image
            src={mainImage}
            alt={tour.name}
            fill
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1280px) 100vw, 800px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Top Left Badge */}
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
            <ImageIcon className="h-3.5 w-3.5 text-sky-400" />
            <span>Hình ảnh thực tế</span>
          </div>

          <div className="absolute bottom-4 left-4 z-10 text-white">
            <p className="text-xs uppercase tracking-wider text-white/80 font-bold">Hành trình tuyệt đẹp</p>
            <p className="text-sm sm:text-base font-extrabold drop-shadow">{tour.name}</p>
          </div>
        </div>

        {/* Thumbnail strip: click to replace main image, scroll horizontally when many */}
        <div className="group/thumbnails relative">
          {images.length > 5 && (
            <>
              <button
                type="button"
                aria-label="Cuộn ảnh sang trái"
                onClick={() => scrollThumbnails("left")}
                className="absolute left-1 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-white hover:text-sky-600 sm:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                aria-label="Cuộn ảnh sang phải"
                onClick={() => scrollThumbnails("right")}
                className="absolute right-1 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-white hover:text-sky-600 sm:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            ref={thumbnailScrollRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-1 sm:gap-3"
          >
            {images.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`Xem ảnh ${idx + 1}`}
                className={`relative aspect-[4/3] w-[112px] shrink-0 snap-start overflow-hidden rounded-xl border-2 transition-all sm:w-[150px] ${
                  activeImageIndex === idx
                    ? "border-sky-500 ring-2 ring-sky-200"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Ảnh ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="150px"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Full Image Gallery Modal */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4 sm:p-6 backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 text-white">
            <h3 className="text-lg font-bold">Thư viện ảnh tour ({images.length} ảnh)</h3>
            <button
              type="button"
              onClick={() => setIsGalleryModalOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="custom-scrollbar grid flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setActiveImageIndex(idx);
                  setIsGalleryModalOpen(false);
                }}
                className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-800 cursor-pointer hover:opacity-90"
              >
                <Image src={img} alt={`Ảnh gallery ${idx + 1}`} fill className="object-cover" sizes="300px" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
