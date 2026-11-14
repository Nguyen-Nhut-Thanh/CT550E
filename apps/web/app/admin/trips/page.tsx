"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { useWorkforceIdentity } from "@/components/admin/layout/AdminGuard";
import { CrewPanel } from "@/components/admin/workforce/CrewPanel";
import { TripsFilterBar, TripsPageHeader } from "@/components/admin/trips";
import { workforceApi } from "@/lib/admin/workforce/api";
import { useToast } from "@/lib/notifications/useToast";
import {
  WORKFORCE_REGIONS,
  type Employee,
  type RegionCode,
  type WorkforceSchedule,
} from "shared";

export default function TripsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center p-8 text-sm text-slate-500">
          <div className="flex items-center gap-3">
            <RefreshCw className="size-5 animate-spin text-blue-600" />
            <span>Đang tải thông tin điều hành chuyến…</span>
          </div>
        </div>
      }
    >
      <TripsContent />
    </Suspense>
  );
}

function TripsContent() {
  const actor = useWorkforceIdentity();
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const [mode, setMode] = useState<"all" | "mine">("all");
  const [region, setRegion] = useState("");
  const [scheduleId, setScheduleId] = useState<number | undefined>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<WorkforceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const requestSequence = useRef(0);

  // Sync state with URL params
  useEffect(() => {
    if (!actor) return;
    const requestedSchedule = Number(searchParams.get("schedule"));
    const requestedRegion = searchParams.get("region") || "";
    const requestedMode = searchParams.get("tab") === "mine" || !actor.isManager ? "mine" : "all";

    setMode(requestedMode);
    setRegion(
      requestedRegion && Object.hasOwn(WORKFORCE_REGIONS, requestedRegion) && actor.isManager
        ? requestedRegion
        : ""
    );
    setScheduleId(
      Number.isSafeInteger(requestedSchedule) && requestedSchedule > 0
        ? requestedSchedule
        : undefined
    );
  }, [actor, searchParams]);

  const load = useCallback(async () => {
    if (!actor) return;
    const sequence = ++requestSequence.current;
    setLoading(true);
    setError("");

    try {
      const scopeRegion = mode === "mine" ? "" : region;
      const [people, trips] = await Promise.all([
        actor.isManager ? workforceApi.employees() : Promise.resolve([]),
        workforceApi.schedules(scopeRegion),
      ]);

      if (sequence !== requestSequence.current) return;
      setEmployees(people);
      setSchedules(trips);
    } catch (e) {
      if (sequence === requestSequence.current) {
        setError(e instanceof Error ? e.message : "Không thể tải dữ liệu điều hành.");
      }
    } finally {
      if (sequence === requestSequence.current) {
        setLoading(false);
      }
    }
  }, [actor, mode, region]);

  useEffect(() => {
    void load();
  }, [load]);

  const mutate = async (action: () => Promise<unknown>, successMsg: string): Promise<boolean> => {
    setBusy(true);
    try {
      await action();
      toast.success(successMsg);
      await load();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Thao tác thất bại.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const updateNavigation = (
    nextMode: "all" | "mine",
    nextRegion: string,
    nextScheduleId?: number
  ) => {
    const params = new URLSearchParams();
    if (nextMode === "mine") params.set("tab", "mine");
    if (nextRegion) params.set("region", nextRegion);
    if (nextScheduleId) params.set("schedule", String(nextScheduleId));
    router.replace(`/admin/trips?${params.toString()}`);
  };

  if (!actor) return null;

  const selectedSchedule = scheduleId
    ? schedules.find((s) => s.tour_schedule_id === scheduleId)
    : undefined;

  const visibleSchedules = scheduleId
    ? schedules.filter((s) => s.tour_schedule_id === scheduleId)
    : schedules;

  const myTripsCount = schedules.filter((s) =>
    s.crew.some((m) => m.user_id === actor.userId)
  ).length;

  return (
    <div className="space-y-5 pb-12 font-sans">
      {/* Page Header with Stats */}
      <TripsPageHeader
        scheduleId={scheduleId}
        schedules={schedules}
        loading={loading}
        onRefresh={() => void load()}
      />

      {/* Tabs & Filters */}
      <TripsFilterBar
        isManager={actor.isManager}
        mode={mode}
        region={region}
        myTripsCount={myTripsCount}
        totalTripsCount={schedules.length}
        onModeChange={(nextMode) =>
          updateNavigation(nextMode, nextMode === "mine" ? "" : region)
        }
        onRegionChange={(nextRegion) =>
          updateNavigation("all", nextRegion, scheduleId)
        }
      />

      {/* Focus schedule alert banner */}
      {scheduleId && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-600 text-white">
              <CalendarDays size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-blue-900">
                Đang lọc riêng chuyến #{scheduleId}
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {selectedSchedule?.tours.name || `Chuyến khởi hành #${scheduleId}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateNavigation(mode, region, undefined)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-xs hover:bg-blue-50 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Xem tất cả chuyến</span>
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="text-xs font-bold underline hover:no-underline cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Main Operations Panel */}
      <CrewPanel
        key={`${mode}:${region}:${scheduleId ?? "all"}`}
        actor={actor}
        schedules={visibleSchedules}
        employees={employees}
        busy={busy}
        onlyMine={mode === "mine"}
        initialStatusFilter={scheduleId || mode === "mine" ? "all" : "upcoming"}
        onRegion={async (id, code, reasonStr) => {
          await mutate(
            () => workforceApi.setRegion(id, code as RegionCode, reasonStr),
            "Đã cập nhật miền điều hành cho chuyến."
          );
        }}
        onAssign={(id, body) =>
          mutate(
            () => workforceApi.crew(id, body),
            "Đã lưu phân công nhân sự. Nhân viên có thể xác nhận chuyến."
          )
        }
        onRespond={(id, action, note) =>
          mutate(() => workforceApi.respond(id, action, note), "Đã ghi nhận phản hồi chuyến.")
        }
      />
    </div>
  );
}
