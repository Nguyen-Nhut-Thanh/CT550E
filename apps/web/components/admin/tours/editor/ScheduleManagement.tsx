"use client";

import { AdminPagination } from "@/components/admin/common/AdminPagination";
import CustomDropdown from "@/components/common/forms/CustomDropdown";
import { ConfirmDialog } from "@/components/common/overlays/ConfirmDialog";
import { deleteTourSchedule, getTourSchedules } from "@/lib/admin/schedules/api";
import { getScheduleBookedCount, getScheduleStatusMeta } from "@/lib/admin/schedules/status";
import { filterTourSchedules, formatScheduleDate, getSchedulePickupOptions } from "@/lib/admin/schedules/tour-schedules";
import { useToast } from "@/lib/notifications/useToast";
import { formatVND } from "@/lib/utils/currency";
import { AlertTriangle, ArrowRight, Banknote, CalendarDays, Loader2, MapPin, Palmtree, Pencil, Plane, Plus, RefreshCw, Search, Tag, Trash2, UsersRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AdminSchedule, CustomDropdownProps } from "shared";

function ScheduleFilter(props: Pick<CustomDropdownProps, "ariaLabel" | "selectedValue" | "options" | "onSelect" | "icon">) {
  return <CustomDropdown {...props} variant="compact" matchTriggerWidth className="min-w-0 [&_button[aria-haspopup=listbox]]:min-h-11 [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:rounded-[14px] [&_button[aria-haspopup=listbox]]:border-[#dce7f7] [&_button[aria-haspopup=listbox]]:bg-white/80 [&_button[aria-haspopup=listbox]]:px-3 [&_button[aria-haspopup=listbox]]:text-[13px] [&_button[aria-haspopup=listbox]]:font-medium [&_button[aria-haspopup=listbox]]:shadow-[0_2px_5px_#21477808]" />;
}

export function ScheduleManagement({ tourId }: { tourId?: number }) {
  const pageSize = 10;
  const { success, error: showError } = useToast();
  const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
  const [loading, setLoading] = useState(Boolean(tourId));
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState("");
  const [pickup, setPickup] = useState("all");
  const [time, setTime] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const deleting = useRef(false);

  useEffect(() => {
    if (!tourId) { setSchedules([]); setLoading(false); return; }
    let active = true;
    setSchedules([]);
    setLoading(true);
    setLoadError("");
    void getTourSchedules<AdminSchedule>(tourId).then(items => {
      if (active) setSchedules(items);
    }).catch(error => {
      if (active) setLoadError(error instanceof Error ? error.message : "Không thể tải lịch khởi hành.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [tourId, reload]);

  const pickupOptions = useMemo(() => [{ value: "all", label: "Tất cả điểm đón" }, ...getSchedulePickupOptions(schedules)], [schedules]);
  const filteredSchedules = useMemo(() => filterTourSchedules(schedules, { search, pickup, time, status: statusFilter }), [schedules, search, pickup, time, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredSchedules.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const visibleSchedules = filteredSchedules.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = Boolean(search.trim() || pickup !== "all" || time !== "all" || statusFilter !== "all");

  useEffect(() => { setCurrentPage(1); }, [tourId, search, pickup, time, statusFilter]);
  useEffect(() => { setCurrentPage(current => Math.min(current, totalPages)); }, [totalPages]);

  const resetFilters = () => {
    setSearch(""); setPickup("all"); setTime("all"); setStatusFilter("all"); setCurrentPage(1);
  };
  const handleDelete = async () => {
    if (pendingDeleteId === null || deleting.current) return;
    const id = pendingDeleteId;
    deleting.current = true;
    setDeletingId(id);
    try {
      await deleteTourSchedule(id);
      setSchedules(current => current.filter(schedule => schedule.tour_schedule_id !== id));
      setPendingDeleteId(null);
      success("Đã xóa lịch khởi hành thành công");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Không thể xóa lịch khởi hành.");
    } finally {
      deleting.current = false;
      setDeletingId(null);
    }
  };

  return <section aria-labelledby="tour-schedules-title" aria-busy={loading} className="@container/tour-schedules relative isolate min-w-0 overflow-hidden rounded-[28px] border border-white bg-[linear-gradient(125deg,#ffffff_0%,#f5faff_100%)] p-4 pb-10 text-[#11254b] shadow-[0_7px_24px_#5c91ce12] sm:p-6 sm:pb-12">
    <div aria-hidden="true" className="pointer-events-none absolute top-0 right-[14%] -z-[1] h-[118px] w-[43%] bg-[url('/images/about/our-story-ha-long-bay.png')] bg-cover bg-[center_56%] opacity-[.17] [mask-image:linear-gradient(90deg,transparent,#000_35%,#000_80%,transparent)] max-sm:hidden" />
    <div aria-hidden="true" className="pointer-events-none absolute top-4 right-[34%] h-[72px] w-[225px] text-[#87c2ff] max-lg:hidden">
      <svg viewBox="0 0 240 75" fill="none" className="size-full"><path d="M0 65C40 78 112 19 98 22C68 26 115 66 146 44S197 25 226 5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="5 5" /></svg>
      <MapPin size={17} className="absolute top-4 left-[83px]" />
      <Plane size={32} strokeWidth={1.1} fill="currentColor" className="absolute top-0 right-0 rotate-[14deg]" />
    </div>

    <header className="relative mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="grid size-[52px] shrink-0 place-items-center rounded-[18px] bg-[linear-gradient(135deg,#f0f7ff,#ddecff)] text-[#0967ff]"><CalendarDays size={29} strokeWidth={1.8} /></span>
        <div>
          <h2 id="tour-schedules-title" className="text-[23px] leading-[1.3] font-extrabold tracking-[-.6px]! text-[#10214b]">Lịch khởi hành</h2>
          <p className="mt-1 text-[13px] leading-[1.6] text-[#667a9c]">Quản lý các đợt khởi hành của tour một cách trực quan và linh hoạt.</p>
        </div>
      </div>
      <Link href={tourId ? `/admin/schedules/new?tourId=${tourId}` : "/admin/schedules"} aria-describedby={!tourId ? "tour-schedules-save-hint" : undefined} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[16px] border border-[#277bff] bg-[linear-gradient(120deg,#368eff,#0754f7)] px-5 py-3 text-[14px] font-bold text-white shadow-[0_5px_14px_#226ffe26] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500">
        <Plus size={20} /> Thêm lịch mới
      </Link>
    </header>

    <fieldset disabled={loading || !tourId} className="mb-4 grid min-w-0 gap-3 disabled:opacity-60 sm:grid-cols-2 @min-[900px]/tour-schedules:grid-cols-[minmax(180px,1.55fr)_minmax(145px,1fr)_minmax(145px,1fr)_minmax(145px,1fr)_auto]">
      <legend className="sr-only">Tìm kiếm và lọc lịch khởi hành</legend>
      <div className="relative min-w-0 sm:col-span-2 @min-[900px]/tour-schedules:col-span-1">
        <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#7b91b3]" />
        <input type="search" aria-label="Tìm kiếm lịch khởi hành" placeholder="Tìm kiếm lịch khởi hành..." value={search} onChange={event => setSearch(event.target.value)} className="min-h-11 w-full rounded-[14px] border border-[#dce7f7] bg-white/80 py-2.5 pr-3 pl-10 text-[13px] text-[#243d65] shadow-[0_2px_5px_#21477808] outline-none placeholder:text-[#8c9cb6] focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
      </div>
      <ScheduleFilter ariaLabel="Lọc theo điểm đón hoặc nơi xuất phát" selectedValue={pickup} options={pickupOptions} onSelect={setPickup} icon={MapPin} />
      <ScheduleFilter ariaLabel="Lọc theo thời gian khởi hành" selectedValue={time} options={[
        { value: "all", label: "Tất cả thời gian" }, { value: "upcoming", label: "Sắp khởi hành" },
        { value: "this-month", label: "Tháng này" }, { value: "next-month", label: "Tháng sau" }, { value: "past", label: "Đã khởi hành" },
      ]} onSelect={setTime} icon={CalendarDays} />
      <ScheduleFilter ariaLabel="Lọc theo trạng thái lịch khởi hành" selectedValue={statusFilter} options={[
        { value: "all", label: "Tất cả trạng thái" }, { value: "selling", label: "Đang nhận khách" },
        { value: "full", label: "Đã hết chỗ" }, { value: "hidden", label: "Tạm khóa" }, { value: "past", label: "Đã khởi hành" },
      ]} onSelect={setStatusFilter} icon={Tag} />
      <button type="button" onClick={() => { resetFilters(); setReload(current => current + 1); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#d5e5ff] bg-[linear-gradient(#fff,#e8f3ff)] px-4 text-[13px] font-semibold whitespace-nowrap text-[#426eac] transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-wait">
        <RefreshCw size={17} /> Làm mới
      </button>
    </fieldset>

    {loading ? <div role="status" className="space-y-3 py-2">
      <span className="sr-only">Đang tải lịch khởi hành</span>
      {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-[83px] animate-pulse rounded-[17px] border border-[#e3edfa] bg-blue-50/60" />)}
    </div> : loadError ? <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-5 text-[13px] text-rose-700">
      <span>{loadError}</span><button type="button" onClick={() => setReload(current => current + 1)} className="font-bold underline underline-offset-2">Tải lại</button>
    </div> : visibleSchedules.length === 0 ? <div className="flex min-h-[175px] flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-[#dbe8fa] bg-white/60 px-5 py-8 text-center">
      <CalendarDays size={32} strokeWidth={1.5} className="text-[#98b9e7]" />
      <p className="text-[14px] font-semibold text-[#4d6a92]">{!tourId ? "Tạo lịch khởi hành sau khi lưu tour" : hasFilters ? "Không tìm thấy lịch khởi hành phù hợp" : "Tour chưa có lịch khởi hành"}</p>
      <p id={!tourId ? "tour-schedules-save-hint" : undefined} className="max-w-md text-[12px] leading-[1.7] text-[#8495ae]">{!tourId ? "Lưu tour trước để tạo lịch khởi hành gắn với tour này tại trang quản lý lịch khởi hành." : hasFilters ? "Thử thay đổi từ khóa, điểm đón, thời gian hoặc trạng thái." : "Bấm Thêm lịch mới để thiết lập ngày đi, điểm đón và các dịch vụ cho chuyến đi."}</p>
      {hasFilters && <button type="button" onClick={resetFilters} className="text-[13px] font-semibold text-blue-600 hover:underline">Xóa bộ lọc</button>}
    </div> : <div role="region" aria-label="Danh sách lịch khởi hành của tour" tabIndex={0} className="overflow-x-auto rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
      <table className="w-full min-w-[1020px] border-separate border-spacing-x-0 border-spacing-y-2.5 text-left">
        <thead><tr className="bg-[#eef5ff]/70 text-[11px] font-bold text-[#617a9f] uppercase">
          {["Thời gian", "Giá vé", "Đã đặt / Tổng chỗ", "Mức lấp đầy", "Trạng thái", "Thao tác"].map(label => <th key={label} scope="col" className="px-4 py-3 font-bold first:rounded-l-[14px] last:rounded-r-[14px] last:text-right">{label}</th>)}
        </tr></thead>
        <tbody>
          {visibleSchedules.map(schedule => {
            const booked = getScheduleBookedCount(schedule);
            const percent = schedule.quota > 0 ? Math.min(100, Math.round(booked / schedule.quota * 100)) : 0;
            const status = getScheduleStatusMeta(schedule);
            const label = status.label === "Đang hoạt động" ? "Đang nhận khách" : status.label;
            return <tr key={schedule.tour_schedule_id} className="group bg-white/95 text-[13px] shadow-[0_3px_8px_#477fb009] transition-colors hover:bg-[#fafdff] [&>td]:border-y [&>td]:border-[#e3edfa] [&>td]:px-4 [&>td]:py-[18px] [&>td:first-child]:rounded-l-[17px] [&>td:first-child]:border-l [&>td:last-child]:rounded-r-[17px] [&>td:last-child]:border-r">
              <td><div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[linear-gradient(#f1f8ff,#e4f1ff)] text-[#3695ff]"><CalendarDays size={20} /></span>
                <div><div className="flex items-center gap-2 text-[14px] font-extrabold whitespace-nowrap text-[#10254e]">{formatScheduleDate(schedule.start_date)} <ArrowRight size={15} className="text-[#3a94ff]" /> {formatScheduleDate(schedule.end_date)}</div><p className="mt-1 text-[12px] text-[#7287a6]">{schedule.departure_location?.name || "Chưa có nơi xuất phát"} · {schedule.pickup_points?.length ?? 0} điểm đón</p></div>
              </div></td>
              <td><div className="flex items-center gap-2.5 whitespace-nowrap"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#eaf4ff] text-[#147cff]"><Banknote size={18} /></span><strong className="text-[16px] font-extrabold text-[#0560ff] tabular-nums">{formatVND(schedule.price)}</strong></div></td>
              <td><div className="flex items-center gap-2 text-[16px] whitespace-nowrap text-[#142b50] tabular-nums"><UsersRound size={20} className="text-[#8a9dbb]" /><span><strong className="font-bold text-[#078b59]">{booked}</strong> / {schedule.quota}</span></div></td>
              <td><div className="min-w-[95px] max-w-[140px]">
                <span className="mb-2 block text-[12px] font-bold text-[#7d90ad] tabular-nums">{percent}%</span>
                <div role="progressbar" aria-label={`Mức lấp đầy lịch ngày ${formatScheduleDate(schedule.start_date)}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${booked} trên ${schedule.quota} chỗ`} className="h-2 overflow-hidden rounded-full bg-[#e5eefc]">
                  <div style={{ width: `${percent}%` }} className={`h-full rounded-full ${percent >= 100 ? "bg-rose-400" : percent >= 80 ? "bg-amber-400" : "bg-[#3392ff]"}`} />
                </div>
              </div></td>
              <td><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold whitespace-nowrap uppercase ${status.tone === "success" ? "border-[#cff3e1] bg-[#e6fbf1] text-[#049650]" : status.tone === "warning" ? "border-amber-100 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}><span className="size-1.5 shrink-0 rounded-full bg-current" />{label}</span></td>
              <td><div className="flex items-center justify-end gap-3 whitespace-nowrap">
                <Link href={`/admin/schedules/${schedule.tour_schedule_id}`} aria-label={`Chỉnh sửa lịch khởi hành ngày ${formatScheduleDate(schedule.start_date)}`} className="inline-flex items-center gap-1.5 font-semibold text-[#0766ff] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"><Pencil size={17} />Chỉnh sửa</Link>
                <span aria-hidden="true" className="h-4 w-px bg-[#dce7f7]" />
                <button type="button" disabled={deletingId !== null} aria-label={`Xóa lịch khởi hành ngày ${formatScheduleDate(schedule.start_date)}`} onClick={() => setPendingDeleteId(schedule.tour_schedule_id)} className="rounded-lg p-1.5 text-[#8a9dbb] transition hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-2 focus-visible:outline-rose-400 disabled:cursor-wait disabled:opacity-40">{deletingId === schedule.tour_schedule_id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}</button>
              </div></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>}

    {!loading && !loadError && filteredSchedules.length > pageSize && <AdminPagination variant="numbered" currentPage={page} totalPages={totalPages} totalItems={filteredSchedules.length} pageSize={pageSize} itemLabel="lịch khởi hành" onPageChange={setCurrentPage} />}
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-[1] h-[45px] overflow-hidden text-[#b9e3f7]">
      <Palmtree size={55} strokeWidth={1.3} className="absolute bottom-[-10px] left-[-4px] -rotate-[15deg] opacity-60" />
      <Palmtree size={42} strokeWidth={1.3} className="absolute right-1 bottom-[-8px] rotate-[12deg] opacity-60" />
      <svg viewBox="0 0 1200 45" preserveAspectRatio="none" fill="none" className="absolute inset-x-0 bottom-0 h-7 w-full"><path d="M0 15C70-5 130 44 225 40H965C1060 44 1140-8 1200 20V45H0Z" fill="#e4f3ff" /></svg>
    </div>
    <ConfirmDialog open={pendingDeleteId !== null} icon={<AlertTriangle size={32} />} title="Xóa lịch khởi hành?" description="Lịch khởi hành này sẽ bị xóa khỏi tour. Hành động này không thể hoàn tác." confirmLabel={deletingId !== null ? "Đang xóa..." : "Xác nhận xóa"} cancelLabel="Hủy bỏ" onConfirm={() => { void handleDelete(); }} onCancel={() => { if (!deleting.current) setPendingDeleteId(null); }} />
  </section>;
}
