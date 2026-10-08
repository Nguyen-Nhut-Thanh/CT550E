import { getDestinationCardClassName } from "./DestinationCard";

export default function DestinationGridSkeleton() {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 auto-rows-[120px] gap-2 md:grid-cols-9 md:auto-rows-[85px]">
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className={`${getDestinationCardClassName(index)} animate-pulse bg-gray-100`}
        />
      ))}
    </div>
  );
}

