import { formatVND } from "@/lib/utils/currency";
import { Camera, Check, Luggage, ShieldCheck, UserRound } from "lucide-react";
import type { BookingExtraService } from "shared";

export function BookingExtraServices({
  services,
  selectedIds,
  onChange,
  loading,
  error,
  onRetry,
}: {
  services: BookingExtraService[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  return (
    <section className="rounded-2xl border border-blue-100/60 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <Luggage className="h-5 w-5 text-blue-700" />
        3. Dịch vụ bổ sung
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Tùy chọn dịch vụ để chuyến đi của bạn trọn vẹn hơn.
      </p>
      {loading ? (
        <p role="status" className="mt-4 text-sm text-slate-500">
          Đang tải dịch vụ...
        </p>
      ) : error ? (
        <div className="mt-4 text-sm text-slate-500">
          Chưa tải được dịch vụ bổ sung. Bạn vẫn có thể đặt tour.
          <button
            type="button"
            onClick={onRetry}
            className="ml-2 font-semibold text-blue-600"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {services.map((service) => {
            const checked = selectedIds.includes(service.id);
            const Icon =
              service.id === "private_guide"
                ? UserRound
                : service.id === "travel_insurance"
                  ? ShieldCheck
                  : Camera;
            const backgrounds: Record<string, string> = {
              private_guide: "/images/booking/private-tour-guide.png",
              travel_insurance: "/images/booking/travel-insurance.png",
              photography: "/images/booking/photography.png",
            };
            return (
              <label
                key={service.id}
                style={{
                  backgroundImage: `url("${backgrounds[service.id] || "/images/booking/ticket-background.png"}")`,
                  backgroundSize: "105% 128%",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                className={`relative min-h-[132px] cursor-pointer overflow-hidden rounded-xl border p-4 transition focus-within:ring-2 focus-within:ring-blue-200 ${checked ? "border-blue-500 ring-2 ring-blue-200" : "border-blue-100 hover:border-blue-300"}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) =>
                    onChange(
                      event.target.checked
                        ? [...selectedIds, service.id]
                        : selectedIds.filter((id) => id !== service.id),
                    )
                  }
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <Icon className="h-6 w-6 text-blue-700" />
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${checked ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}
                  >
                    {checked && <Check className="h-3 w-3" />}
                  </span>
                </div>
                <div className="mt-3 w-fit rounded-md bg-white/80 px-1.5 py-1">
                  <p className="text-xs font-bold text-slate-800">
                    {service.name}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    {formatVND(service.unit_price)}
                    <span className="font-normal text-slate-500">
                      /
                      {service.pricing_unit === "guest"
                        ? "khách"
                        : service.pricing_unit === "booking"
                          ? "đơn đặt tour"
                          : "nhóm"}
                    </span>
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      )}
      <p className="mt-3 text-[11px] text-slate-500">
        Hướng dẫn viên riêng tính phí một lần cho mỗi đơn đặt tour, không nhân
        theo số khách. Bảo hiểm tính theo từng khách.
      </p>
    </section>
  );
}
