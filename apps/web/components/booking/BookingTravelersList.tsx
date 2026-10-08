import { UserRound } from "lucide-react";
import { AdminDatePicker } from "@/components/admin/AdminDatePicker";
import { formatVND } from "@/lib/client/utils/utils";
import type { TravelerForm, TravelerType } from "@/lib/client/utils/booking";
import type { TourSchedule } from "shared";

interface BookingTravelersListProps {
  travelers: TravelerForm[];
  selectedSchedule: TourSchedule;
  singleRoomSelections: boolean[];
  singleRoomUnitPrice: number;
  getUnitPrice: (schedule: TourSchedule | null, type: TravelerType) => number;
  onUpdateTraveler: (
    index: number,
    field: keyof TravelerForm,
    value: string,
  ) => void;
  onUpdateSingleRoomSelection: (adultIndex: number, checked: boolean) => void;
}

export function BookingTravelersList({
  travelers,
  selectedSchedule,
  singleRoomSelections,
  singleRoomUnitPrice,
  getUnitPrice,
  onUpdateTraveler,
  onUpdateSingleRoomSelection,
}: BookingTravelersListProps) {
  const getTravelerLabel = (type: TravelerType) => {
    if (type === "adult") return "Người lớn";
    if (type === "child") return "Trẻ em";
    return "Em bé";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          Danh sách hành khách
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Có thể hoàn thiện sau, nhưng nên nhập trước để giảm thao tác khi chốt
          booking.
        </p>
      </div>

      <p className="mb-4 text-sm text-slate-500">
        Chỉ cần nhập cho người lớn và trẻ em. Em bé không cần khai báo riêng ở
        bước này.
      </p>

      <div className="space-y-4">
        {travelers.map((traveler, index) => {
          const adultIndex =
            traveler.type === "adult"
              ? travelers
                  .slice(0, index + 1)
                  .filter((item) => item.type === "adult").length - 1
              : -1;

          return (
            <div
              key={`${traveler.type}-${index}`}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Hành khách {index + 1}
                    </p>
                    <p className="text-xs text-slate-500">
                      {getTravelerLabel(traveler.type)}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-[#ef3b2d]">
                  {formatVND(getUnitPrice(selectedSchedule, traveler.type))}
                </span>
              </div>

              <div
                className={`grid gap-4 ${
                  traveler.type === "adult"
                    ? "md:grid-cols-4"
                    : "md:grid-cols-3"
                }`}
              >
                <input
                  value={traveler.fullName}
                  onChange={(event) =>
                    onUpdateTraveler(index, "fullName", event.target.value)
                  }
                  placeholder="Họ và tên"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                />
                <select
                  value={traveler.gender}
                  onChange={(event) =>
                    onUpdateTraveler(
                      index,
                      "gender",
                      event.target.value as TravelerForm["gender"],
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
                <AdminDatePicker
                  value={traveler.birthday}
                  onChange={(date) =>
                    onUpdateTraveler(index, "birthday", date)
                  }
                  placeholder="Chọn ngày sinh"
                  allowManualInput
                />
                {traveler.type === "adult" ? (
                  <label
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-1.5 transition min-h-[46px] ${
                      singleRoomSelections[adultIndex]
                        ? "border-sky-300 bg-sky-50/70"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      checked={singleRoomSelections[adultIndex] ?? false}
                      onChange={(event) =>
                        onUpdateSingleRoomSelection(
                          adultIndex,
                          event.target.checked,
                        )
                      }
                    />
                    <div className="min-w-0 leading-tight">
                      <p className="text-[13px] font-bold text-slate-900">
                        Phòng đơn
                      </p>
                      <p className="text-[10px] font-bold text-[#ef3b2d]">
                        + {formatVND(singleRoomUnitPrice)}
                      </p>
                    </div>
                  </label>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
