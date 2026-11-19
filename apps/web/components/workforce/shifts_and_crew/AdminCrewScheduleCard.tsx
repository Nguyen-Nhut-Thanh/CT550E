"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  History,
  LockKeyhole,
  MapPin,
  Phone,
  UsersRound,
} from "lucide-react";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { AdminPermissionNotice } from "@/components/common/admin_shared/guards/AdminContentPermission";
import { ImageWithFallback } from "@/components/common/dialogs_and_feedback/media/ImageWithFallback";
import { workforceDate } from "@/lib/workforce/admin/api";
import {
  getWorkforceTripStatus,
  WORKFORCE_TRIP_STATUSES,
} from "@/lib/workforce/admin/trips";
import {
  ADMIN_CONTENT_DENIED,
  canManageWorkforceRegion,
  CREW_ROLES,
  WORKFORCE_REGIONS,
  type CrewRole,
  type WorkforceActor,
  type WorkforceSchedule,
} from "shared";

export function requiresCrewOverride(
  schedule: WorkforceSchedule,
  now = Date.now(),
) {
  return (
    Boolean(schedule.crew_locked_at || schedule.crew_snapshot) ||
    Date.parse(schedule.start_date) - now <= 86400_000
  );
}

export function CrewScheduleCard({
  actor,
  schedule,
  busy,
  onlyMine,
  onEdit,
  onRegion,
  onRespond,
  onDecline,
  onHistory,
  onManifest,
}: {
  actor: WorkforceActor;
  schedule: WorkforceSchedule;
  busy: boolean;
  onlyMine: boolean;
  onEdit: () => void;
  onRegion: (id: number, region: string, reason?: string) => Promise<void>;
  onRespond: (id: number, action: string) => Promise<boolean>;
  onDecline: (id: number) => void;
  onHistory: () => void;
  onManifest?: (id: number) => void;
}) {
  const [region, setRegion] = useState(schedule.operating_region ?? "");
  const [reason, setReason] = useState("");
  useEffect(() => {
    setRegion(schedule.operating_region ?? "");
    setReason("");
  }, [schedule.operating_region, schedule.operating_region_source]);
  const now = Date.now();
  const canManage = canManageWorkforceRegion(actor, schedule.operating_region);
  const past = Date.parse(schedule.start_date) <= now;
  const deadline =
    schedule.crew_lock_deadline ??
    new Date(Date.parse(schedule.start_date) - 86400_000).toISOString();
  const protectedData = requiresCrewOverride(schedule, now);
  const overdue = !schedule.crew_locked_at && Date.parse(deadline) <= now;
  const trip = WORKFORCE_TRIP_STATUSES[getWorkforceTripStatus(schedule, now)];
  const roles = (Object.keys(CREW_ROLES) as CrewRole[]).filter(
    (role) =>
      role !== "deputy_leader" ||
      schedule.crew.some((member) => member.roles.includes(role)),
  );
  const regionChanged = region !== schedule.operating_region;
  const needsReason = protectedData && regionChanged;
  const canSaveRegion =
    !!region &&
    (regionChanged || schedule.operating_region_source !== "admin") &&
    (!needsReason || !!reason.trim());
  const members = [...schedule.crew].sort(
    (a, b) =>
      Object.keys(CREW_ROLES).findIndex((role) =>
        a.roles.includes(role as CrewRole),
      ) -
      Object.keys(CREW_ROLES).findIndex((role) =>
        b.roles.includes(role as CrewRole),
      ),
  );
  const stateClasses = {
    pending: "border-amber-200 bg-amber-100/70 text-amber-800",
    confirmed: "border-emerald-200 bg-emerald-100/70 text-emerald-800",
    declined: "border-rose-200 bg-rose-100/70 text-rose-700",
    completed: "border-blue-200 bg-blue-50 text-blue-700",
  };
  const stateLabels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã nhận chuyến",
    declined: "Đã từ chối",
    completed: "Hoàn thành",
  };
  return (
    <details className="group overflow-hidden bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-3.5 sm:px-5 sm:py-3.5 text-left transition-colors hover:bg-blue-50/30 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
        <div className="crew-schedule-header-content flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
          <span className="crew-schedule-thumbnail relative w-[108px] h-[82px] sm:w-[124px] sm:h-[90px] shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-blue-50 shadow-2xs">
            <ImageWithFallback
              src={schedule.cover_image_url ?? undefined}
              alt={schedule.tours.name}
              width={128}
              height={96}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </span>
          <div className="crew-schedule-header-text flex flex-col justify-center gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-[#075bff] border border-blue-100 text-[11px] font-bold leading-none tracking-wide">
                {schedule.code || `Chuyến ${schedule.tour_schedule_id}`}
              </span>
            </div>
            <h2
              className="truncate text-[15px] sm:text-[16px] font-[750] leading-snug tracking-tight text-[#0b1747]"
              title={schedule.tours.name}
            >
              {schedule.tours.name}
            </h2>
            {schedule.tours.summary?.trim() && (
              <p
                className="min-w-0 max-w-3xl truncate text-xs leading-normal text-[#637da5]"
                title={schedule.tours.summary.trim()}
              >
                {schedule.tours.summary.trim()}
              </p>
            )}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-x-5 gap-y-1 text-xs text-[#7387aa] pt-0.5">
              <p className="flex items-center gap-1.5 shrink-0">
                <CalendarDays
                  size={13.5}
                  className="shrink-0 text-[#075bff]"
                />
                <span>
                  {workforceDate(schedule.start_date)} —{" "}
                  {workforceDate(schedule.end_date)}
                </span>
              </p>
              <p className="flex items-center gap-1.5 truncate">
                <MapPin size={13.5} className="shrink-0 text-[#075bff]" />
                <span className="truncate">
                  Khởi hành: <strong className="font-semibold text-slate-700">{schedule.departure_location.name}</strong> ·{" "}
                  <strong className="font-bold text-[#075bff]">{schedule.booked_count}</strong> khách giữ chỗ
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap uppercase ${trip.className}`}
            >
              {trip.label}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${
                schedule.crew_locked_at
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : overdue
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : schedule.crew_ready
                      ? "border-[#cff3e1] bg-[#e6fbf1] text-[#049650]"
                      : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              {schedule.crew_locked_at ? (
                <LockKeyhole size={12} />
              ) : (
                <AlertCircle size={12} />
              )}
              {schedule.crew_locked_at
                ? "Đã chốt nhân sự"
                : overdue
                  ? "Quá hạn chốt"
                  : schedule.crew_ready
                    ? "Đủ xác nhận"
                    : "Thiếu xác nhận nhân sự"}
            </span>
          </div>
          <span
            className="grid size-8 shrink-0 place-items-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-[#075bff] transition"
            aria-hidden="true"
          >
            <ChevronDown
              size={16}
              className="transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
            />
          </span>
        </div>
      </summary>
      <div className="border-t border-[#edf2fb]" />
      <div className="grid min-w-0 gap-3.5 p-4.5 sm:p-5 lg:grid-cols-[minmax(250px,.85fr)_minmax(0,1.65fr)] bg-[#f8fbff]/60">
        <aside className="min-w-0 space-y-4 rounded-[14px] border border-[#e1edfc] bg-white p-4.5 shadow-2xs">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#0b1747]">
              Miền điều hành
            </p>
            {actor.isManager && !onlyMine ? (
              <fieldset
                disabled={busy || !actor.isAdmin}
                title={!actor.isAdmin ? ADMIN_CONTENT_DENIED : undefined}
                className="space-y-2"
              >
                <CustomDropdown
                  ariaLabel={`Miền điều hành ${schedule.code || schedule.tour_schedule_id}`}
                  variant="compact"
                  matchTriggerWidth
                  className="min-w-0 [&_button[aria-haspopup]]:min-w-0 [&_button[aria-haspopup]]:rounded-lg [&_button[aria-haspopup]]:bg-white [&_button[aria-haspopup]]:text-xs"
                  selectedValue={region}
                  onSelect={setRegion}
                  options={[
                    { value: "", label: "Chưa xác định miền" },
                    ...Object.entries(WORKFORCE_REGIONS).map(
                      ([value, label]) => ({ value, label }),
                    ),
                  ]}
                />
                {needsReason && (
                  <textarea
                    value={reason}
                    maxLength={1000}
                    onChange={(event) => setReason(event.target.value)}
                    rows={2}
                    placeholder="Lý do thay đổi miền sau khi chốt/quá hạn..."
                    aria-label="Lý do thay đổi miền"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                  />
                )}
                <button
                  type="button"
                  disabled={busy || !canSaveRegion}
                  onClick={() =>
                    void onRegion(
                      schedule.tour_schedule_id,
                      region,
                      reason.trim() || undefined,
                    )
                  }
                  className="text-[11px] font-semibold text-[#075bff] hover:underline disabled:text-slate-300 cursor-pointer"
                >
                  {schedule.operating_region_source === "admin"
                    ? "Lưu miền"
                    : "Xác nhận miền"}
                </button>
              </fieldset>
            ) : (
              <p className="text-sm font-semibold text-slate-700">
                {schedule.operating_region
                  ? WORKFORCE_REGIONS[schedule.operating_region]
                  : "Chưa xác định"}
              </p>
            )}
            <p className="mt-1.5 text-[11px] leading-4 text-slate-500">
              {schedule.operating_region_source === "admin"
                ? "Miền đã được admin xác nhận."
                : "Tạm xác định theo nơi xuất phát; admin có thể điều chỉnh."}
            </p>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-bold text-[#0b1747]">
                {schedule.crew_confirmed_count} người đã xác nhận
              </p>
              <span className="text-[11px] text-slate-500">
                {schedule.crew.length} đã phân công
              </span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Nhân sự đã nhận chuyến"
              aria-valuenow={Math.min(
                100,
                (schedule.crew_confirmed_count / schedule.crew_required_count) *
                  100,
              )}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-[#075bff]"
                style={{
                  width: `${Math.min(100, (schedule.crew_confirmed_count / schedule.crew_required_count) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Tối thiểu {schedule.crew_required_count} người, có thể kiêm nhiệm
              vai trò.
            </p>
          </div>
          <div className="space-y-2">
            {roles.map((role) => {
              const assigned = schedule.crew.filter((member) =>
                member.roles.includes(role),
              );
              const confirmed = assigned.filter((member) =>
                ["confirmed", "completed"].includes(member.status),
              ).length;
              const isOptionalForSingleCrew =
                schedule.crew_required_count === 1 &&
                schedule.crew.some(
                  (m) =>
                    m.roles.includes("tour_leader") ||
                    m.roles.includes("guide"),
                );
              const label = !assigned.length
                ? isOptionalForSingleCrew
                  ? "Không bắt buộc"
                  : "Chưa phân công"
                : assigned.some((member) => member.status === "declined")
                  ? "Cần thay người"
                  : confirmed === assigned.length
                    ? "Đã xác nhận"
                    : "Chờ xác nhận";
              return (
                <div
                  key={role}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e1edfc] bg-white px-3.5 py-2.5 shadow-2xs"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-[#243954]">
                    <UsersRound size={14} className="text-[#075bff]" />
                    {CREW_ROLES[role]}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      label === "Đã xác nhận"
                        ? "bg-[#e6fbf1] text-[#049650] border border-[#cff3e1]"
                        : label === "Chờ xác nhận"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : label === "Không bắt buộc"
                            ? "bg-slate-50 text-slate-400 border border-slate-200 font-medium"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <p
            className={`flex items-start gap-1.5 text-[11.5px] leading-5 ${overdue ? "text-rose-600 font-medium" : "text-slate-500"}`}
          >
            <Clock3 size={13} className="mt-1 shrink-0 text-[#075bff]" />
            {schedule.crew_locked_at
              ? `Đã chốt lúc ${workforceDate(schedule.crew_locked_at)}`
              : `Hạn chốt: ${workforceDate(deadline)} (trước khởi hành 24 giờ)`}
          </p>
        </aside>
        <div className="min-w-0 space-y-3">
          {!members.length ? (
            <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-[#cfe2ff] bg-white p-6 text-center text-xs text-slate-500">
              Chưa phân công nhân sự cho chuyến này.
            </div>
          ) : (
            members.map((member) => (
              <article
                key={member.assignment_id}
                className="rounded-[14px] border border-[#e1edfc] bg-white p-4.5 shadow-2xs transition-colors hover:border-blue-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-xs font-bold text-[#075bff] border border-blue-100">
                      {member.user.full_name
                        .split(" ")
                        .filter(Boolean)
                        .slice(-2)
                        .map((word) => word[0])
                        .join("")}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-[750] text-[#0b1747]">
                        {member.user.full_name}
                      </h3>
                      <p className="mt-0.5 text-xs font-semibold text-[#075bff]">
                        {member.roles
                          .map((role) => CREW_ROLES[role])
                          .join(" kiêm ")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${stateClasses[member.status]}`}
                  >
                    {stateLabels[member.status]}
                  </span>
                </div>
                <p className="mt-2.5 flex items-center gap-2 text-xs font-medium text-[#415d85]">
                  <CalendarDays
                    size={14}
                    className="shrink-0 text-[#075bff]"
                  />
                  <span>
                    Điều động: <strong className="font-semibold text-slate-700">{workforceDate(member.report_at)}</strong> →{" "}
                    <strong className="font-semibold text-slate-700">{workforceDate(member.release_at)}</strong>
                  </span>
                </p>
                {member.user.phone && (
                  <p className="mt-1 flex items-center gap-2 text-xs text-[#7387aa]">
                    <Phone size={13} className="shrink-0 text-[#075bff]" />
                    <span>{member.user.phone}</span>
                  </p>
                )}
                {member.note && (
                  <p className="mt-2 rounded-lg bg-slate-50 border border-slate-100 p-2.5 text-xs leading-5 text-slate-600">
                    {member.note}
                  </p>
                )}
                {member.response_note && (
                  <p className="mt-2 rounded-lg bg-amber-50/70 border border-amber-100 p-2.5 text-xs leading-5 text-amber-800 font-medium">
                    Phản hồi: {member.response_note}
                  </p>
                )}
                {member.user_id === actor.userId && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {member.status === "pending" &&
                      Date.parse(schedule.end_date) > now && (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void onRespond(member.assignment_id, "confirm")
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#075bff] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition shadow-xs disabled:opacity-50 cursor-pointer"
                          >
                            <Check size={13} />
                            Nhận chuyến
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onDecline(member.assignment_id)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition shadow-2xs disabled:opacity-50 cursor-pointer"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    {member.status === "confirmed" &&
                      Date.parse(schedule.end_date) <= now && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void onRespond(member.assignment_id, "complete")
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#075bff] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          Xác nhận hoàn thành
                        </button>
                      )}
                  </div>
                )}
              </article>
            ))
          )}
          {!!schedule.crew_issues.length && (
            <ul className="list-inside list-disc rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs leading-6 text-amber-800">
              {schedule.crew_issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <footer className="border-t border-[#edf2fb] px-5 py-3.5 sm:px-6 bg-slate-50/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
            <button
              type="button"
              onClick={() => onManifest?.(schedule.tour_schedule_id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-[#075bff] hover:bg-blue-50 transition shadow-xs cursor-pointer"
            >
              <UsersRound size={15} />
              <span>Xem danh sách đoàn ({schedule.booked_count} khách)</span>
            </button>
            {actor.isManager && !onlyMine && (
              <>
                <button
                  type="button"
                  disabled={
                    busy ||
                    past ||
                    !canManage ||
                    !schedule.operating_region ||
                    (protectedData && !actor.isAdmin)
                  }
                  title={!canManage ? ADMIN_CONTENT_DENIED : undefined}
                  onClick={onEdit}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#075bff] px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 transition shadow-xs disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <UsersRound size={16} />
                  {protectedData && actor.isAdmin
                    ? "Sửa ngoại lệ / thay người"
                    : "Phân công / thay người"}
                </button>
                <button
                  type="button"
                  onClick={onHistory}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#637da5] hover:text-[#075bff] transition cursor-pointer"
                >
                  <History size={15} />
                  Lịch sử thay đổi
                </button>
                <Link
                  href={`/admin/schedules/${schedule.tour_schedule_id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#075bff] hover:underline"
                >
                  <CalendarDays size={15} />
                  Chi tiết lịch khởi hành
                </Link>
              </>
            )}
          </div>
          {actor.isManager && !onlyMine && !canManage && (
            <AdminPermissionNotice className="ml-auto shrink-0" />
          )}
        </div>
        {actor.isManager && !onlyMine && (
          <p className="mt-2.5 text-[11px] leading-5 text-slate-500">
            {past
              ? "Chuyến đã khởi hành, không thay đổi phân công."
              : protectedData
                ? "Thông tin đã chốt hoặc đã đến hạn 24 giờ. Chỉ admin được sửa ngoại lệ có lý do; hệ thống thông báo lại khi đội ngũ xác nhận đầy đủ."
                : "Hệ thống tự chốt và thông báo cho khách ngay khi đủ nhân sự nhận chuyến."}
          </p>
        )}
      </footer>
    </details>
  );
}
