"use client";
import { useEffect, useState } from "react";
import {
  ADMIN_CONTENT_DENIED,
  canManageWorkforceRegion,
  WORKFORCE_REGIONS,
  type Employee,
  type RegionCode,
  type StaffShift,
  type StaffShiftPayload,
  type WorkforceActor,
} from "shared";
import { fromVietnamInput, workforceDate } from "@/lib/workforce/admin/api";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { DateTimeInput } from "@/components/common/date_time/DateTimeInput";
import { AdminPagination } from "@/components/common/admin_shared/tables/AdminPagination";
import { formatLocalDateTime } from "@/lib/utils/dateTime";
import { Plus } from "lucide-react";

export function ShiftPanel({
  actor,
  employees,
  shifts,
  busy,
  onCreate,
  onCancel,
}: {
  actor: WorkforceActor;
  employees: Employee[];
  shifts: StaffShift[];
  busy: boolean;
  onCreate: (body: StaffShiftPayload) => Promise<void>;
  onCancel: (id: number) => Promise<void>;
}) {
  const [form, setForm] = useState({
    user_id: "",
    duty_type: "page",
    region_code: actor.regions[0] || "south",
    starts_at: "",
    ends_at: "",
    note: "",
  });
  const input =
    "w-full rounded-lg border border-[#dce5f3] bg-white px-3 py-2 text-xs text-[#192e52] outline-none placeholder:text-[#9aa8be] focus:border-[#075bff] focus:ring-2 focus:ring-blue-100 transition-colors";
  const dropdownClass =
    "min-w-0 [&_label]:mb-1 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#07123e] [&_button[aria-haspopup]]:min-w-0 [&_button[aria-haspopup]]:bg-white [&_button[aria-haspopup]]:rounded-lg [&_button[aria-haspopup]]:border-[#e1edfc] [&_button[aria-haspopup]]:py-2 [&_button[aria-haspopup]]:text-xs";
  const [employeeError, setEmployeeError] = useState("");
  const [timeErrors, setTimeErrors] = useState({ start: "", end: "" });
  const [filter, setFilter] = useState("upcoming");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const active = employees.filter(
    (employee) =>
      employee.status === "active" &&
      employee.account_status === 1 &&
      (form.duty_type === "leave" || employee.roles.includes("page_staff")) &&
      (employee.roles.includes("admin") ||
        employee.regions.includes(form.region_code as RegionCode)),
  );
  const rows = shifts.filter(
    (shift) =>
      filter === "all" ||
      (shift.status !== "cancelled" &&
        new Date(shift.ends_at).getTime() > Date.now()),
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, totalPages);
  const visibleRows = rows.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="space-y-3">
      {actor.isManager && (
        <form
          className="space-y-3.5 rounded-[14px] border border-[#e1edfc] bg-white p-4.5 sm:p-5 shadow-2xs"
          onSubmit={(e) => {
            e.preventDefault();
            if (busy) return;
            const start = form.starts_at ? new Date(form.starts_at) : null;
            const end = form.ends_at ? new Date(form.ends_at) : null;
            const errors = {
              start:
                !start || !Number.isFinite(start.getTime())
                  ? "Vui lòng chọn thời điểm bắt đầu."
                  : "",
              end:
                !end || !Number.isFinite(end.getTime())
                  ? "Vui lòng chọn thời điểm kết thúc."
                  : start && end <= start
                    ? "Thời điểm kết thúc phải sau thời điểm bắt đầu."
                    : "",
            };
            const employeeValid = active.some(
              (employee) => String(employee.user_id) === form.user_id,
            );
            setTimeErrors(errors);
            setEmployeeError(
              employeeValid
                ? ""
                : "Vui lòng chọn nhân viên phù hợp với loại lịch và miền.",
            );
            if (!employeeValid || errors.start || errors.end) return;
            void onCreate({
              ...form,
              user_id: Number(form.user_id),
              duty_type: form.duty_type as "page" | "leave",
              region_code: form.region_code as RegionCode,
              starts_at: fromVietnamInput(form.starts_at),
              ends_at: fromVietnamInput(form.ends_at),
            }).then(() => setForm((prev) => ({ ...prev, note: "" })));
          }}
        >
          <div>
            <h2 className="text-[15px] font-bold text-[#07123e]">
              Xếp ca trực & lịch nghỉ
            </h2>
            <p className="mt-0.5 text-xs text-[#7187a9]">
              Giờ Việt Nam. Hệ thống kiểm tra trùng lịch trực, nghỉ và thời gian
              điều động đi tour.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <CustomDropdown
              label="Loại lịch"
              variant="compact"
              matchTriggerWidth
              className={dropdownClass}
              selectedValue={form.duty_type}
              onSelect={(value) => {
                setForm({ ...form, duty_type: value, user_id: "" });
                setEmployeeError("");
              }}
              options={[
                { value: "page", label: "Trực page" },
                { value: "leave", label: "Nghỉ / không sẵn sàng" },
              ]}
            />
            <CustomDropdown
              label="Miền"
              variant="compact"
              matchTriggerWidth
              className={dropdownClass}
              selectedValue={form.region_code}
              onSelect={(value) => {
                setForm({
                  ...form,
                  region_code: value as RegionCode,
                  user_id: "",
                });
                setEmployeeError("");
              }}
              options={Object.entries(WORKFORCE_REGIONS)
                .filter(
                  ([code]) =>
                    actor.isAdmin || actor.regions.includes(code as RegionCode),
                )
                .map(([value, label]) => ({ value, label }))}
            />
            <div>
              <CustomDropdown
                label="Nhân viên"
                variant="compact"
                matchTriggerWidth
                className={dropdownClass}
                selectedValue={form.user_id}
                onSelect={(value) => {
                  setForm({ ...form, user_id: value });
                  setEmployeeError("");
                }}
                options={[
                  { value: "", label: "Chọn nhân viên" },
                  ...active.map((employee) => ({
                    value: String(employee.user_id),
                    label: `${employee.full_name} · ${employee.employee_code}`,
                  })),
                ]}
              />
              {employeeError && (
                <p role="alert" className="mt-1 text-xs text-rose-600">
                  {employeeError}
                </p>
              )}
            </div>
            <DateTimeInput
              label="Bắt đầu"
              value={form.starts_at ? new Date(form.starts_at) : null}
              disabled={busy}
              error={timeErrors.start}
              onChange={(date) => {
                const starts_at = date ? formatLocalDateTime(date) : "";
                setForm((previous) => ({
                  ...previous,
                  starts_at,
                  ends_at:
                    starts_at &&
                    previous.ends_at &&
                    previous.ends_at <= starts_at
                      ? ""
                      : previous.ends_at,
                }));
                setTimeErrors({ start: "", end: "" });
              }}
            />
            <DateTimeInput
              label="Kết thúc"
              value={form.ends_at ? new Date(form.ends_at) : null}
              disabled={busy}
              error={timeErrors.end}
              minDate={
                form.starts_at
                  ? new Date(new Date(form.starts_at).getTime() + 60_000)
                  : undefined
              }
              onChange={(date) => {
                setForm((previous) => ({
                  ...previous,
                  ends_at: date ? formatLocalDateTime(date) : "",
                }));
                setTimeErrors((previous) => ({ ...previous, end: "" }));
              }}
            />
            <label className="text-xs font-semibold text-[#07123e]">
              Ghi chú
              <input
                maxLength={1000}
                className={`mt-1 ${input}`}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Ví dụ: Trực ca tối, trực tổng đài..."
              />
            </label>
          </div>
          <div className="flex justify-end pt-1">
            <button
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#075bff] px-4 py-2 text-xs font-[650] text-white shadow-xs hover:bg-[#064ddd] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Plus size={15} />
              Thêm lịch
            </button>
          </div>
        </form>
      )}
      <div className="rounded-[14px] border border-[#e1edfc] bg-white shadow-xs overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf2fb] px-4.5 py-3.5 bg-white">
          <h2 className="text-sm font-bold text-[#07123e]">
            {actor.isManager
              ? "Danh sách ca trực & lịch nghỉ"
              : "Lịch làm việc của tôi"}
          </h2>
          <div className="w-full sm:w-60 [&_button[aria-haspopup]]:rounded-lg [&_button[aria-haspopup]]:border-[#e1edfc] [&_button[aria-haspopup]]:text-xs">
            <CustomDropdown
              ariaLabel="Lọc lịch làm việc"
              variant="compact"
              matchTriggerWidth
              selectedValue={filter}
              onSelect={setFilter}
              options={[
                { value: "upcoming", label: "Đang diễn ra / sắp tới" },
                { value: "all", label: "Tất cả (gồm lịch sử 30 ngày)" },
              ]}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-xs border-collapse">
            <thead className="bg-slate-50/75 border-b border-[#edf2fb] text-[11px] font-bold uppercase tracking-wider text-[#7187a9]">
              <tr>
                {[
                  "Nhân viên",
                  "Loại lịch / Miền",
                  "Thời gian",
                  "Trạng thái",
                  "",
                ].map((label, i) => (
                  <th key={i} className="px-4.5 py-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2fb]">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#7187a9]">
                    Chưa có lịch trong phạm vi này.
                  </td>
                </tr>
              ) : (
                visibleRows.map((shift) => {
                  const ongoing =
                    shift.status === "scheduled" &&
                    new Date(shift.starts_at).getTime() <= Date.now() &&
                    new Date(shift.ends_at).getTime() > Date.now();
                  return (
                    <tr
                      key={shift.shift_id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4.5 py-3 font-bold text-[#07123e]">
                        {shift.user.full_name}
                      </td>
                      <td className="px-4.5 py-3">
                        <span className="font-semibold text-[#192e52]">
                          {shift.duty_type === "page" ? "Trực page" : "Nghỉ"}
                        </span>
                        <p className="mt-0.5 text-[11px] text-[#7187a9]">
                          {shift.region_code
                            ? WORKFORCE_REGIONS[shift.region_code]
                            : "Toàn quốc"}
                        </p>
                      </td>
                      <td className="px-4.5 py-3 text-[#192e52]">
                        <span className="font-medium">{workforceDate(shift.starts_at)}</span>
                        <p className="mt-0.5 text-[11px] text-[#7187a9]">
                          đến {workforceDate(shift.ends_at)}
                        </p>
                        {shift.note && (
                          <p className="mt-0.5 max-w-xs whitespace-normal text-[11px] text-[#8fa2be]">
                            {shift.note}
                          </p>
                        )}
                      </td>
                      <td className="px-4.5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${
                            shift.status === "cancelled"
                              ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                              : ongoing
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                                : new Date(shift.ends_at).getTime() <= Date.now()
                                  ? "bg-slate-100 text-slate-500 border border-slate-200/80"
                                  : "bg-blue-50 text-blue-700 border border-blue-200/80"
                          }`}
                        >
                          {shift.status === "cancelled"
                            ? "Đã hủy"
                            : ongoing
                              ? shift.duty_type === "page"
                                ? "Đang trực"
                                : "Đang nghỉ"
                              : new Date(shift.ends_at).getTime() <= Date.now()
                                ? "Đã kết thúc"
                                : "Đã xếp lịch"}
                        </span>
                      </td>
                      <td className="px-4.5 py-3 text-right">
                        {actor.isManager &&
                          shift.status !== "cancelled" &&
                          new Date(shift.ends_at).getTime() > Date.now() && (
                            <button
                              disabled={
                                busy ||
                                !canManageWorkforceRegion(
                                  actor,
                                  shift.region_code ?? null,
                                )
                              }
                              title={
                                !canManageWorkforceRegion(
                                  actor,
                                  shift.region_code ?? null,
                                )
                                  ? "Bạn không có quyền điều hành khu vực này"
                                  : undefined
                              }
                              onClick={() => void onCancel(shift.shift_id)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition cursor-pointer disabled:cursor-not-allowed disabled:text-slate-400"
                            >
                              Hủy lịch
                            </button>
                          )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {rows.length > 0 && (
          <AdminPagination
            variant="numbered"
            showSinglePage
            currentPage={current}
            totalPages={totalPages}
            totalItems={rows.length}
            pageSize={pageSize}
            itemLabel="ca trực"
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
