import { Minus, Plus } from "lucide-react";
import { formatVND } from "@/lib/client/utils/utils";
import type { TravelerType } from "@/lib/client/utils/booking";

interface BookingPassengerCountsProps {
  adultCount: number;
  childCount: number;
  infantCount: number;
  totalGuests: number;
  adultUnitPrice: number;
  childUnitPrice: number;
  infantUnitPrice: number;
  onCountChange: (type: TravelerType, delta: number) => void;
}

export function BookingPassengerCounts({
  adultCount,
  childCount,
  infantCount,
  totalGuests,
  adultUnitPrice,
  childUnitPrice,
  infantUnitPrice,
  onCountChange,
}: BookingPassengerCountsProps) {
  const getTravelerLabel = (type: TravelerType) => {
    if (type === "adult") return "Người lớn";
    if (type === "child") return "Trẻ em";
    return "Em bé";
  };

  const passengerTypes = [
    {
      type: "adult" as const,
      count: adultCount,
      subtitle: formatVND(adultUnitPrice),
      ageHint: "Từ 12 tuổi trở lên",
    },
    {
      type: "child" as const,
      count: childCount,
      subtitle: formatVND(childUnitPrice),
      ageHint: "Từ 2 -> 12 tuổi",
    },
    {
      type: "infant" as const,
      count: infantCount,
      subtitle: formatVND(infantUnitPrice),
      ageHint: "Dưới 2 tuổi",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Số lượng hành khách
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Vui lòng chọn đúng độ tuổi và số lượng hành khách.
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-right">
          <p className="text-xs font-medium text-slate-500">Tổng khách</p>
          <p className="text-lg font-bold text-slate-900">{totalGuests}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {passengerTypes.map((item) => (
          <div
            key={item.type}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-slate-900">
                  {getTravelerLabel(item.type)}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#ef3b2d]">
                  {item.subtitle}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  {item.ageHint}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onCountChange(item.type, -1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-base font-bold text-slate-900">
                  {item.count}
                </span>
                <button
                  type="button"
                  onClick={() => onCountChange(item.type, 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
