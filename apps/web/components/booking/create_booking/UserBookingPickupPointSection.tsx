"use client";

import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { MapPin } from "lucide-react";
import type { SchedulePickupPoint, TourSchedule } from "shared";

export interface BookingPickupPointSectionProps {
  selectedSchedule: TourSchedule;
  pickupPointId: number | "";
  editingPickup: boolean;
  onToggleEditingPickup: () => void;
  onSelectPickupPoint: (pointId: number | "") => void;
}

export function BookingPickupPointSection({
  selectedSchedule,
  pickupPointId,
  editingPickup,
  onToggleEditingPickup,
  onSelectPickupPoint,
}: BookingPickupPointSectionProps) {
  const pickupPoints = selectedSchedule.pickup_points || [];
  if (!pickupPoints.length) return null;

  const selectedPoint = pickupPoints.find(
    (point) => point.pickup_point_id === pickupPointId,
  );

  return (
    <section className="space-y-3 rounded-2xl border border-blue-100 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">
          {pickupPointId ? "Điểm đón đã chọn" : "Chọn điểm đón"}
        </h2>
        {!!pickupPointId && pickupPoints.length > 1 && (
          <button
            type="button"
            onClick={onToggleEditingPickup}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            {editingPickup ? "Đóng" : "Thay đổi"}
          </button>
        )}
      </div>
      <p className="text-sm text-slate-500">
        Áp dụng cho tất cả hành khách trong đơn đặt này.
      </p>

      {(!pickupPointId || editingPickup) && (
        <div id="booking-pickup" className="w-full">
          <CustomDropdown
            ariaLabel="Điểm đón của bạn"
            variant="compact"
            matchTriggerWidth
            icon={MapPin}
            placeholder="Chọn điểm đón của bạn"
            selectedValue={pickupPointId ? String(pickupPointId) : ""}
            options={pickupPoints.map((point) => ({
              value: String(point.pickup_point_id),
              label: `${point.name} — ${new Date(point.pickup_at).toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
              })}`,
            }))}
            onSelect={(val) => {
              onSelectPickupPoint(val ? Number(val) : "");
            }}
            className="w-full [&_button]:min-w-0 [&_button]:py-3"
          />
        </div>
      )}

      {selectedPoint && (
        <div className="rounded-xl bg-sky-50 p-3 text-sm text-slate-700 space-y-1">
          <p className="font-semibold text-slate-900">{selectedPoint.name}</p>
          <p className="text-xs text-slate-600">{selectedPoint.address}</p>
          <p className="text-xs text-blue-700 font-medium">
            Có mặt lúc{" "}
            {new Date(selectedPoint.pickup_at).toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
            })}
          </p>
          {selectedPoint.note && (
            <p className="text-xs text-slate-500 italic mt-1">
              Ghi chú: {selectedPoint.note}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

