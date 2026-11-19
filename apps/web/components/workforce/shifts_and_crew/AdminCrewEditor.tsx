"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { CalendarDays, MapPin, Plus, UsersRound, X } from "lucide-react";
import {
  CREW_ROLES,
  WORKFORCE_REGIONS,
  type CrewPayload,
  type CrewRole,
  type Employee,
  type WorkforceSchedule,
} from "shared";
import { Dialog } from "@/components/common/dialogs_and_feedback/dialogs/Dialog";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { DateTimeInput } from "@/components/common/date_time/DateTimeInput";
import { formatLocalDateTime } from "@/lib/utils/dateTime";
import {
  fromVietnamInput,
  vietnamInput,
  workforceDate,
} from "@/lib/workforce/admin/api";

type AssignmentForm = {
  key: number;
  roles: CrewRole[];
  user_id: string;
  report_at: string;
  release_at: string;
  note: string;
};
const roleKeys = Object.keys(CREW_ROLES) as CrewRole[];
const roleRank = (roles: CrewRole[]) =>
  roleKeys.findIndex((role) => roles.includes(role));
const dropdownClass =
  "min-w-0 [&_label]:mb-2 [&_label]:block [&_label]:text-[13px] [&_label]:font-medium [&_label]:text-slate-700 [&_button[aria-haspopup]]:min-h-11 [&_button[aria-haspopup]]:min-w-0 [&_button[aria-haspopup]]:rounded-lg [&_button[aria-haspopup]]:border-slate-300 [&_button[aria-haspopup]]:bg-white [&_button[aria-haspopup]]:text-sm";
const dateTimeClass =
  "[&_label]:mb-2 [&_label]:text-[13px] [&_label]:font-medium [&_label]:text-slate-700 [&_button[aria-haspopup=dialog]]:rounded-lg [&_button[aria-haspopup=dialog]]:border-slate-300";

export function CrewEditor({
  schedule,
  employees,
  busy,
  onClose,
  onSave,
  requireOverride = false,
}: {
  schedule: WorkforceSchedule;
  employees: Employee[];
  busy: boolean;
  requireOverride?: boolean;
  onClose: () => void;
  onSave: (body: CrewPayload) => Promise<void>;
}) {
  const titleId = useId();
  const summaryId = useId();
  const nextKey = useRef(-1);
  const newItem = (roles: CrewRole[]): AssignmentForm => ({
    key: nextKey.current--,
    roles,
    user_id: "",
    report_at: vietnamInput(schedule.start_date),
    release_at: vietnamInput(schedule.end_date),
    note: "",
  });
  const [items, setItems] = useState<AssignmentForm[]>(() =>
    schedule.crew.length
      ? [...schedule.crew]
          .sort((a, b) => roleRank(a.roles) - roleRank(b.roles))
          .map((item) => ({
            key: item.assignment_id,
            roles: roleKeys.filter((role) => item.roles.includes(role)),
            user_id: String(item.user_id),
            report_at: vietnamInput(item.report_at),
            release_at: vietnamInput(item.release_at),
            note: item.note || "",
          }))
      : [newItem(["tour_leader"])],
  );
  const [requiredCount, setRequiredCount] = useState(
    String(schedule.crew_required_count),
  );
  const [error, setError] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const tourStart = new Date(vietnamInput(schedule.start_date));
  const tourEnd = new Date(vietnamInput(schedule.end_date));
  const eligible = (employee: Employee, roles: CrewRole[]) =>
    employee.status === "active" &&
    employee.account_status === 1 &&
    (employee.roles.includes("admin") ||
      (roles.every((role) => employee.roles.includes(role)) &&
        employee.regions.includes(schedule.operating_region!)));

  function update(key: number, changes: Partial<AssignmentForm>) {
    setItems((previous) =>
      previous.map((item) =>
        item.key === key ? { ...item, ...changes } : item,
      ),
    );
    setError("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (requireOverride && !overrideReason.trim()) {
      setError("Vui lòng ghi lý do sửa thông tin đã chốt hoặc quá hạn.");
      return;
    }
    if (items.some((item) => item.roles.length === 0)) {
      setError("Vui lòng chọn ít nhất một chức vụ cho từng nhân sự trước khi lưu.");
      return;
    }
    if (
      items.some(
        (item) =>
          !employees.some(
            (employee) =>
              String(employee.user_id) === item.user_id &&
              eligible(employee, item.roles),
          ),
      )
    ) {
      setError(
        "Vui lòng chọn nhân viên hợp lệ và có đủ vai trò cho từng dòng hoặc gỡ dòng không sử dụng.",
      );
      return;
    }
    if (new Set(items.map((item) => item.user_id)).size !== items.length) {
      setError("Mỗi nhân viên chỉ được chọn một lần trong chuyến.");
      return;
    }
    if (
      items.some(
        (item) =>
          !item.report_at ||
          !item.release_at ||
          !Number.isFinite(Date.parse(item.report_at)) ||
          !Number.isFinite(Date.parse(item.release_at)),
      )
    ) {
      setError("Vui lòng chọn đầy đủ ngày giờ bắt đầu và kết thúc điều động.");
      return;
    }
    if (
      items.some(
        (item) =>
          item.release_at <= item.report_at ||
          item.report_at > vietnamInput(schedule.start_date) ||
          item.release_at < vietnamInput(schedule.end_date),
      )
    ) {
      setError(
        "Thời gian điều động phải bao trọn chuyến: bắt đầu không muộn hơn giờ khởi hành và kết thúc không sớm hơn giờ kết thúc chuyến.",
      );
      return;
    }
    setError("");
    void onSave({
      crew_required_count: Number(requiredCount),
      ...(requireOverride ? { override_reason: overrideReason.trim() } : {}),
      assignments: items.map(({ key, ...item }) => ({
        ...item,
        user_id: Number(item.user_id),
        report_at: fromVietnamInput(item.report_at),
        release_at: fromVietnamInput(item.release_at),
      })),
    });
  }

  return (
    <Dialog
      onClose={() => !busy && onClose()}
      labelledBy={titleId}
      describedBy={summaryId}
    >
      <div className="relative z-10 my-auto flex max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl border border-[#e1edfc] text-[#092448]">
        {/* Nút đóng tròn nổi */}
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          aria-label="Đóng phân công nhân sự"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-slate-900 cursor-pointer disabled:opacity-40"
        >
          <X size={18} />
        </button>

        {/* Header gradient banner chuẩn */}
        <header className="relative isolate shrink-0 pt-5 pb-4 px-6 overflow-hidden border-b border-[#e1edfc] bg-gradient-to-r from-blue-50/90 to-sky-50/50">
          <div className="space-y-1.5 pr-10">
            <div className="flex items-center gap-2">
              <span className="uppercase text-[10px] tracking-wider text-blue-800 font-extrabold bg-white/90 px-2.5 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                Phân công nhân sự
              </span>
              <span className="text-[12px] font-bold text-[#075bff]">
                {schedule.code || `#${schedule.tour_schedule_id}`}
              </span>
            </div>
            <h2
              id={titleId}
              className="text-lg sm:text-xl font-black text-[#092448]"
            >
              {schedule.tours.name}
            </h2>
            <div
              id={summaryId}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium"
            >
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} className="shrink-0 text-[#075bff]" />
                {workforceDate(schedule.start_date)} → {workforceDate(schedule.end_date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="shrink-0 text-[#075bff]" />
                {schedule.departure_location.name}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#075bff]">
                <UsersRound size={14} />
                {schedule.operating_region
                  ? WORKFORCE_REGIONS[schedule.operating_region]
                  : "Chưa chọn miền điều hành"}
              </span>
            </div>
          </div>
        </header>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
            {/* Card số lượng nhân sự tối thiểu */}
            <div className="rounded-[14px] border border-[#e1edfc] bg-white p-4 shadow-2xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-3 text-xs font-bold text-[#0b1747]">
                  <span>Số nhân sự tối thiểu</span>
                  <input
                    required
                    type="number"
                    min={1}
                    max={2147483647}
                    step={1}
                    disabled={busy}
                    className="h-8.5 w-20 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#075bff] focus:ring-1 focus:ring-blue-100 shadow-2xs disabled:opacity-50"
                    value={requiredCount}
                    onChange={(event) => {
                      setRequiredCount(event.target.value);
                      setError("");
                    }}
                  />
                </label>
                <p className="text-xs text-slate-500">
                  Đã phân công:{" "}
                  <strong className="font-bold text-[#075bff]">
                    {items.filter((item) => item.user_id).length}
                  </strong>{" "}
                  / <strong>{requiredCount || "…"}</strong> người
                </p>
              </div>
              <p className="text-[11.5px] leading-5 text-slate-500">
                Chuyến cần có cả Trưởng đoàn và Hướng dẫn viên. Mỗi nhân sự chọn
                một chức vụ; có thể thêm Phó đoàn tùy quy mô chuyến.
              </p>
            </div>

            {requireOverride && (
              <div className="rounded-[14px] border border-amber-200 bg-amber-50/70 p-4 text-xs font-semibold text-amber-800 space-y-2">
                <p className="font-bold">Lý do sửa ngoại lệ (bắt buộc)</p>
                <textarea
                  required
                  maxLength={1000}
                  rows={2}
                  disabled={busy}
                  value={overrideReason}
                  onChange={(event) => setOverrideReason(event.target.value)}
                  placeholder="Ví dụ: hướng dẫn viên có việc đột xuất, cần thay người..."
                  className="w-full rounded-lg border border-amber-200 bg-white p-2.5 text-xs font-normal text-slate-700 outline-none focus:border-amber-400"
                />
                <p className="text-[11px] font-normal leading-4 text-amber-700">
                  Thay đổi được lưu lịch sử. Hệ thống công bố lại khi nhân sự
                  xác nhận đầy đủ.
                </p>
              </div>
            )}

            {/* Danh sách từng nhân sự */}
            <div className="space-y-3">
              {items.map((item, index) => {
                const candidates = employees.filter(
                  (employee) =>
                    (String(employee.user_id) === item.user_id ||
                      eligible(employee, item.roles)) &&
                    !items.some(
                      (other) =>
                        other.key !== item.key &&
                        other.user_id === String(employee.user_id),
                    ),
                );
                const selectedEmployee = employees.find(
                  (emp) => String(emp.user_id) === item.user_id,
                );
                const hasMissingRolesWarning =
                  selectedEmployee &&
                  !selectedEmployee.roles.includes("admin") &&
                  item.roles.some((r) => !selectedEmployee.roles.includes(r));
                return (
                  <fieldset
                    key={item.key}
                    disabled={busy}
                    className="min-w-0 rounded-[14px] border border-[#e1edfc] bg-white p-4.5 shadow-2xs space-y-3"
                  >
                    <legend className="sr-only">Nhân sự {index + 1}</legend>
                    <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[#edf2fb]">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b1747]">
                        Nhân sự {String(index + 1).padStart(2, "0")}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setItems((previous) =>
                            previous.filter((row) => row.key !== item.key),
                          );
                          setError("");
                        }}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-100 transition cursor-pointer disabled:opacity-40"
                      >
                        Gỡ nhân sự
                      </button>
                    </div>
                    <div className="grid min-w-0 gap-x-4 gap-y-3 sm:grid-cols-2">
                      <div className="min-w-0 sm:col-span-2">
                        <CustomDropdown
                          label="Nhân viên"
                          ariaLabel={`Nhân viên ${index + 1}`}
                          variant="compact"
                          matchTriggerWidth
                          className={dropdownClass}
                          selectedValue={item.user_id}
                          onSelect={(value) =>
                            update(item.key, { user_id: value })
                          }
                          options={[
                            { value: "", label: "Chọn nhân viên" },
                            ...candidates.map((employee) => ({
                              value: String(employee.user_id),
                              label: `${employee.full_name} · ${employee.employee_code}`,
                            })),
                          ]}
                        />
                        {!candidates.length && (
                          <p className="mt-1 text-xs leading-5 text-amber-700">
                            Chưa có nhân viên đang hoạt động đáp ứng vai trò và
                            miền này.
                          </p>
                        )}
                        {hasMissingRolesWarning && (
                          <p className="mt-1 text-xs leading-5 text-rose-600">
                            * Nhân viên này chưa được cấp quyền{" "}
                            {item.roles
                              .filter((r) => !selectedEmployee.roles.includes(r))
                              .map((r) => CREW_ROLES[r])
                              .join(", ")}{" "}
                            trong Hồ sơ nhân sự.
                          </p>
                        )}
                      </div>
                      <div className="min-w-0 sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-bold text-slate-700">
                          Chức vụ trong chuyến{" "}
                          <span className="font-normal text-slate-500">
                            (có thể tích chọn nhiều để kiêm nhiệm vai trò)
                          </span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {roleKeys.map((role) => {
                            const checked = item.roles.includes(role);
                            return (
                              <label
                                key={role}
                                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                                  checked
                                    ? "border-[#075bff] bg-blue-50 text-[#075bff] shadow-2xs ring-1 ring-blue-500/20"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="size-3.5 rounded border-slate-300 text-[#075bff] focus:ring-blue-500"
                                  checked={checked}
                                  onChange={(e) => {
                                    const nextRoles = e.target.checked
                                      ? [...item.roles, role]
                                      : item.roles.filter((r) => r !== role);
                                    update(item.key, { roles: nextRoles });
                                  }}
                                />
                                <span>{CREW_ROLES[role]}</span>
                              </label>
                            );
                          })}
                        </div>
                        {item.roles.length > 0 ? (
                          <p className="mt-1.5 text-xs font-medium text-[#075bff]">
                            Vai trò đảm nhiệm:{" "}
                            {item.roles.map((r) => CREW_ROLES[r]).join(" kiêm ")}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-rose-600">
                            * Vui lòng tích chọn ít nhất một chức vụ cho nhân sự này.
                          </p>
                        )}
                      </div>
                      <DateTimeInput
                        label="Bắt đầu điều động"
                        ariaLabel={`Bắt đầu điều động nhân sự ${index + 1}`}
                        className={dateTimeClass}
                        value={item.report_at ? new Date(item.report_at) : null}
                        maxDate={tourStart}
                        disabled={busy}
                        onChange={(date) =>
                          update(item.key, {
                            report_at: date ? formatLocalDateTime(date) : "",
                          })
                        }
                      />
                      <DateTimeInput
                        label="Kết thúc điều động"
                        ariaLabel={`Kết thúc điều động nhân sự ${index + 1}`}
                        className={dateTimeClass}
                        value={item.release_at ? new Date(item.release_at) : null}
                        minDate={tourEnd}
                        disabled={busy}
                        onChange={(date) =>
                          update(item.key, {
                            release_at: date ? formatLocalDateTime(date) : "",
                          })
                        }
                      />
                      <label className="block min-w-0 text-xs font-bold text-slate-700 sm:col-span-2">
                        Ghi chú điều động
                        <input
                          maxLength={1000}
                          className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#075bff] focus:ring-1 focus:ring-blue-100 shadow-2xs disabled:opacity-50"
                          value={item.note}
                          placeholder="Ví dụ: Phụ trách xe số 2..."
                          onChange={(event) =>
                            update(item.key, { note: event.target.value })
                          }
                        />
                      </label>
                    </div>
                  </fieldset>
                );
              })}
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setItems((previous) => [
                    ...previous,
                    newItem(
                      previous.some((item) =>
                        item.roles.includes("tour_leader"),
                      )
                        ? ["guide"]
                        : ["tour_leader"],
                    ),
                  ]);
                  setError("");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-[#075bff] hover:bg-blue-100 transition shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-[#075bff] disabled:opacity-40"
              >
                <Plus size={16} />
                Thêm nhân sự
              </button>
              <p className="text-[11.5px] leading-5 text-slate-500">
                Thời gian điều động phải bao trọn chuyến. Có thể lưu phân công
                chưa đủ người để bổ sung sau; hệ thống kiểm tra trùng lịch khi
                lưu.
              </p>
              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600"
                >
                  {error}
                </p>
              )}
            </div>
          </div>

          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#e1edfc] bg-slate-50/50 px-6 py-3.5">
            <p className="text-xs text-slate-500 font-medium">Giờ Việt Nam (GMT+7)</p>
            <div className="ml-auto flex items-center gap-2.5">
              <button
                type="button"
                disabled={busy}
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-[12px] bg-[#075bff] px-5 py-2 text-xs font-bold text-white hover:bg-blue-600 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {busy ? "Đang lưu..." : "Lưu phân công"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </Dialog>
  );
}
