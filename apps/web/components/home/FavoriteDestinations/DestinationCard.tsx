import Link from "next/link";
import type { FeaturedDestinationItem } from "shared";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200";

export function getDestinationCardClassName(index: number): string {
  const layouts = [
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-1 md:col-end-4 md:row-start-1 md:row-end-7 h-full", // Ô 1: Cột 1-3, Hàng 1-6
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-4 md:col-end-6 md:row-start-1 md:row-end-4 h-full", // Ô 2: Cột 4-5, Hàng 1-3
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-6 md:col-end-10 md:row-start-1 md:row-end-4 h-full", // Ô 3: Cột 6-9, Hàng 1-3
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-4 md:col-end-6 md:row-start-4 md:row-end-7 h-full", // Ô 4: Cột 4-5, Hàng 4-6
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-6 md:col-end-8 md:row-start-4 md:row-end-7 h-full", // Ô 5: Cột 6-7, Hàng 4-6
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-8 md:col-end-10 md:row-start-4 md:row-end-10 h-full", // Ô 6: Cột 8-9, Hàng 4-9
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-1 md:col-end-3 md:row-start-7 md:row-end-10 h-full", // Ô 7: Cột 1-2, Hàng 7-9
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-3 md:col-end-6 md:row-start-7 md:row-end-10 h-full", // Ô 8: Cột 3-5, Hàng 7-9
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-6 md:col-end-8 md:row-start-7 md:row-end-10 h-full", // Ô 9: Cột 6-7, Hàng 7-9
  ];

  return (
    layouts[index] || "relative group overflow-hidden rounded-2xl cursor-pointer"
  );
}

type DestinationCardProps = {
  item: FeaturedDestinationItem;
  index: number;
};

export default function DestinationCard({ item, index }: DestinationCardProps) {
  // Làm sạch tên: xóa "Tỉnh", "Thành phố", "TP.", "TP", "Thủ đô"
  const displayName = item.name
    .replace(/^(Tỉnh|Thành phố|TP\.|TP|Thủ đô)\s+/i, "")
    .trim();

  return (
    <Link
      href={`/tours?destination=${encodeURIComponent(item.name)}`}
      className={getDestinationCardClassName(index)}
      aria-label={`Khám phá tour ${item.name}`}
    >
      <img
        src={item.image_url || FALLBACK_IMAGE}
        alt={item.alt_text || item.name}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-black/20 transition-all duration-500 group-hover:bg-black/40">
        <div className="flex h-full flex-col items-center justify-center px-4 text-center">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/60 transition-all duration-300 group-hover:text-white group-hover:scale-110 md:text-lg drop-shadow-lg">
            {displayName}
          </h3>
        </div>
      </div>
    </Link>
  );
}

