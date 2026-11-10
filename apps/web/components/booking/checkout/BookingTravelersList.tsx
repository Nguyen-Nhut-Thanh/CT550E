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
  travelerErrors = {},
}: BookingTravelersListProps) {
  const getTravelerLabel = (type: TravelerType) => {
    if (type === "adult") return "Người lớn";
    if (type === "child") return "Trẻ em";
    return "Em bé";
  };

  return (
    <div id="section-booking-travelers" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

          const err = travelerErrors[index] || {};
          const hasError = Object.keys(err).length > 0;

          return (
            <div
              key={`${traveler.type}-${index}`}
              id={`traveler-row-${index}`}
              className={`rounded-xl border p-4 transition-colors ${
                hasError
                  ? "border-rose-300 bg-rose-50/20"
                  : "border-slate-200"
              }`}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      hasError ? "bg-rose-100 text-rose-700" : "bg-blue-50 text-blue-700"
                    }`}
                  >
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
                <div className="min-w-0">
                  <input
                    id={`traveler-${index}-name`}
                    value={traveler.fullName}
                    onChange={(event) =>
                      onUpdateTraveler(index, "fullName", event.target.value)
                    }
                    placeholder="Họ và tên *"
                    className={`min-h-[46px] w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                      err.fullName
                        ? "border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-100"
                        : "border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white"
                    }`}
                  />
                  {err.fullName && (
                    <p className="mt-1 text-xs font-medium text-rose-500">{err.fullName}</p>
                  )}
                </div>
                <BookingGenderSelect
                  value={traveler.gender}
                  label={`Giới tính hành khách ${index + 1}`}
                  onChange={(gender) => onUpdateTraveler(index, "gender", gender)}
                />
                <div className="min-w-0">
                  <BirthdayInput
                    id={`traveler-${index}-birthday`}
                    value={traveler.birthday}
                    label={`Ngày sinh hành khách ${index + 1}`}
                    onChange={(value) => onUpdateTraveler(index, "birthday", value)}
                  />
                  {err.birthday && (
                    <p className="mt-1 text-xs font-medium text-rose-500">{err.birthday}</p>
                  )}
                </div>
                {traveler.type === "adult" && (
                  <div className="min-w-0">
                    <input
                      id={`traveler-${index}-id`}
                      value={traveler.idNumber || ""}
                      maxLength={12}
                      onChange={(event) =>
                        onUpdateTraveler(index, "idNumber", event.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Số CCCD (12 số) *"
                      className={`min-h-[46px] w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                        err.idNumber
                          ? "border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-100"
                          : "border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white"
                      }`}
                    />
                    {err.idNumber && (
                      <p className="mt-1 text-xs font-medium text-rose-500">{err.idNumber}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
