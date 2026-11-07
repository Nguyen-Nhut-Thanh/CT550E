import { BookingGenderSelect } from "@/components/booking/checkout/BookingGenderSelect";
import { BirthdayInput } from "@/components/common/calendar/BirthdayInput";
import { formatVND } from "@/lib/utils/currency";
import { UserRound } from "lucide-react";
import type { BookingTravelersListProps, TravelerType } from "shared";

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
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
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

                <div className="flex flex-wrap items-center gap-2.5">
                  {traveler.type === "adult" && (
                    <label
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2 transition min-h-[46px] min-w-[165px] sm:min-w-[175px] ${
                        singleRoomSelections[adultIndex]
                          ? "border-blue-300 bg-blue-50/70"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100/70"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
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
                  )}
                  <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#ef3b2d]">
                    {formatVND(getUnitPrice(selectedSchedule, traveler.type))}
                  </span>
                </div>
              </div>

              <div
                className={`grid items-start gap-3.5 ${
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
                  className="min-h-[46px] min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                />
                <BookingGenderSelect
                  value={traveler.gender}
                  label={`Giới tính hành khách ${index + 1}`}
                  onChange={(gender) => onUpdateTraveler(index, "gender", gender)}
                />
                <BirthdayInput value={traveler.birthday} label={`Ngày sinh hành khách ${index + 1}`} onChange={(value) => onUpdateTraveler(index, "birthday", value)} />
                {traveler.type === "adult" && (
                  <input
                    value={traveler.idNumber || ""}
                    maxLength={12}
                    onChange={(event) =>
                      onUpdateTraveler(index, "idNumber", event.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Số CCCD (12 số) *"
                    className="min-h-[46px] min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
