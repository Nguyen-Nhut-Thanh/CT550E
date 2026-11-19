"use client";

import { BookingGenderSelect } from "@/components/booking/create_booking/UserBookingGenderSelect";
import { ThreeColumnDatePicker } from "@/components/common/date_time/ThreeColumnDatePicker";
import { getTravelerAgeRequirementText } from "@/lib/booking/client/birthday";
import { formatVND } from "@/lib/utils/currency";
import { UserRound } from "lucide-react";
import type { BookingTravelersListProps, TravelerForm, TravelerType } from "shared";

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

  // Gom các khách cùng loại vào chung 1 nhóm/thẻ
  const travelerGroups: Array<{
    type: TravelerType;
    items: Array<{
      traveler: TravelerForm;
      index: number;
    }>;
  }> = [];

  travelers.forEach((traveler, index) => {
    const lastGroup = travelerGroups[travelerGroups.length - 1];
    if (lastGroup && lastGroup.type === traveler.type) {
      lastGroup.items.push({ traveler, index });
    } else {
      travelerGroups.push({
        type: traveler.type,
        items: [{ traveler, index }],
      });
    }
  });

  return (
    <div id="section-booking-travelers" className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Danh sách hành khách
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Vui lòng điền thông tin chính xác theo giấy tờ tùy thân để chuẩn bị thủ tục chuyến đi.
        </p>
      </div>

      {/* Mỗi nhóm cùng 1 loại khách được gom chung trong 1 thẻ */}
      {travelerGroups.map((group) => {
        const ageRequirement = getTravelerAgeRequirementText(
          group.type,
          selectedSchedule?.start_date,
        );

        return (
          <div
            key={group.type}
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm"
          >
            {/* Đầu thẻ mỗi loại khách: Tên loại khách + Điều kiện ngày sinh (chỉ hiện 1 lần duy nhất ở đầu thẻ) */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <UserRound className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {getTravelerLabel(group.type)}
                </h3>
                <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200/60 px-3 py-0.5 text-xs font-semibold text-blue-800">
                  ({ageRequirement})
                </span>
              </div>
            </div>

            <div>
              {group.items.map(({ traveler, index }, itemIndex) => {
                const err = travelerErrors[index] || {};
                const hasError = Object.keys(err).length > 0;

                return (
                  <div
                    key={`${traveler.type}-${index}`}
                    id={`traveler-row-${index}`}
                  >
                    {/* Ngăn cách giữa hành khách 1 với hành khách 2 (không chạm mép trái và phải) */}
                    {itemIndex > 0 && (
                      <div className="my-6 mx-4 sm:mx-8 border-t border-slate-200" />
                    )}

                    {/* Hàng đánh số hành khách (#1, #2...) kèm tùy chọn phòng đơn & giá (không có đường kẻ ngang bên dưới) */}
                    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                            hasError
                              ? "bg-rose-100 text-rose-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          #{index + 1}
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          Hành khách #{index + 1}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Người lớn và Trẻ em đều có ô tích chọn Phòng đơn; Chỉ Em bé là không có */}
                        {traveler.type !== "infant" && (
                          <label
                            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2 transition min-h-[46px] min-w-[165px] sm:min-w-[175px] ${
                              singleRoomSelections[index]
                                ? "border-blue-300 bg-blue-50/70"
                              : "border-slate-200 bg-slate-50 hover:bg-slate-100/70"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              checked={singleRoomSelections[index] ?? false}
                              onChange={(event) =>
                                onUpdateSingleRoomSelection(
                                  index,
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

                    {/* Form nhập thông tin: Nằm liền kề bên dưới hàng đánh số, không bị ngăn cách */}
                    {traveler.type === "adult" ? (
                      /* Người lớn: 4 cột đều nhau (Họ tên, Giới tính, Ngày sinh, CCCD) */
                      <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-3.5">
                        {/* Họ tên */}
                        <div className="min-w-0">
                          <label
                            htmlFor={`traveler-${index}-name`}
                            className="block text-xs font-semibold text-slate-700 mb-1"
                          >
                            Họ tên <span className="text-rose-500 font-bold">(*)</span>
                          </label>
                          <input
                            id={`traveler-${index}-name`}
                            value={traveler.fullName}
                            onChange={(event) =>
                              onUpdateTraveler(index, "fullName", event.target.value)
                            }
                            placeholder="Ví dụ: Nguyễn Văn A"
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

                        {/* Giới tính */}
                        <div className="min-w-0">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Giới tính <span className="text-rose-500 font-bold">(*)</span>
                          </label>
                          <BookingGenderSelect
                            value={traveler.gender}
                            label={`Giới tính hành khách ${index + 1}`}
                            onChange={(gender) => onUpdateTraveler(index, "gender", gender)}
                          />
                        </div>

                        {/* Ngày sinh */}
                        <div className="min-w-0">
                          <label
                            htmlFor={`traveler-${index}-birthday`}
                            className="block text-xs font-semibold text-slate-700 mb-1"
                          >
                            Ngày sinh <span className="text-rose-500 font-bold">(*)</span>
                          </label>
                          <ThreeColumnDatePicker
                            id={`traveler-${index}-birthday`}
                            value={traveler.birthday}
                            label={`Ngày sinh hành khách ${index + 1}`}
                            travelerType={traveler.type}
                            departureDate={selectedSchedule?.start_date}
                            hasError={!!err.birthday}
                            onChange={(value) => onUpdateTraveler(index, "birthday", value)}
                          />
                          {err.birthday && (
                            <p className="mt-1 text-xs font-medium text-rose-500">{err.birthday}</p>
                          )}
                        </div>

                        {/* Số CCCD */}
                        <div className="min-w-0">
                          <label
                            htmlFor={`traveler-${index}-id`}
                            className="block text-xs font-semibold text-slate-700 mb-1"
                          >
                            Số CCCD <span className="text-rose-500 font-bold">(*)</span>
                          </label>
                          <input
                            id={`traveler-${index}-id`}
                            value={traveler.idNumber || ""}
                            maxLength={12}
                            onChange={(event) =>
                              onUpdateTraveler(index, "idNumber", event.target.value.replace(/\D/g, ""))
                            }
                            placeholder="12 số căn cước"
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
                      </div>
                    ) : (
                      /* Trẻ em / Em bé: Tỉ lệ chia cột là 10 cột gồm 3 cột tên, 3 cột phái, 4 cột còn lại dành cho ngày sinh */
                      <div className="grid grid-cols-1 md:grid-cols-10 items-start gap-3.5">
                        {/* 3 cột Tên */}
                        <div className="min-w-0 md:col-span-3">
                          <label
                            htmlFor={`traveler-${index}-name`}
                            className="block text-xs font-semibold text-slate-700 mb-1"
                          >
                            Họ tên <span className="text-rose-500 font-bold">(*)</span>
                          </label>
                          <input
                            id={`traveler-${index}-name`}
                            value={traveler.fullName}
                            onChange={(event) =>
                              onUpdateTraveler(index, "fullName", event.target.value)
                            }
                            placeholder="Ví dụ: Nguyễn Văn A"
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

                        {/* 3 cột Phái (Giới tính) */}
                        <div className="min-w-0 md:col-span-3">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Giới tính <span className="text-rose-500 font-bold">(*)</span>
                          </label>
                          <BookingGenderSelect
                            value={traveler.gender}
                            label={`Giới tính hành khách ${index + 1}`}
                            onChange={(gender) => onUpdateTraveler(index, "gender", gender)}
                          />
                        </div>

                        {/* 4 cột còn lại dành cho Ngày sinh */}
                        <div className="min-w-0 md:col-span-4">
                          <label
                            htmlFor={`traveler-${index}-birthday`}
                            className="block text-xs font-semibold text-slate-700 mb-1"
                          >
                            Ngày sinh <span className="text-rose-500 font-bold">(*)</span>
                          </label>
                          <ThreeColumnDatePicker
                            id={`traveler-${index}-birthday`}
                            value={traveler.birthday}
                            label={`Ngày sinh hành khách ${index + 1}`}
                            travelerType={traveler.type}
                            departureDate={selectedSchedule?.start_date}
                            hasError={!!err.birthday}
                            onChange={(value) => onUpdateTraveler(index, "birthday", value)}
                          />
                          {err.birthday && (
                            <p className="mt-1 text-xs font-medium text-rose-500">{err.birthday}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
