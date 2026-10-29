"use client";

import { TourManagementHeader } from "@/components/admin/tours/management/TourManagementHeader";
import { TourManagementStats } from "@/components/admin/tours/management/TourManagementStats";
import { TourManagementFilters } from "@/components/admin/tours/management/TourManagementFilters";
import { TourManagementTable } from "@/components/admin/tours/management/TourManagementTable";

import { ConfirmDialog } from "@/components/common/overlays/ConfirmDialog";
import { deleteAdminTour, getAdminTours, toggleAdminTourStatus } from "@/lib/admin/tours/api";
import { DEFAULT_TOUR_FILTERS, filterManagedTours } from "@/lib/admin/tours/management";
import { useToast } from "@/lib/notifications/useToast";
import { AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ToursPageTour as Tour } from "shared";

export default function AdminToursPage() {
  const { success, error: showError } = useToast();
  const [items, setItems] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [filters, setFilters] = useState({ ...DEFAULT_TOUR_FILTERS });
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const [pendingDeleteTour, setPendingDeleteTour] = useState<Tour | null>(null);
  const mutationIds = useRef(new Set<number>());

  const loadTours = useCallback(async () => {
    setLoading(true); setFailed(false);
    try { const data = await getAdminTours<Tour>(); setItems(data.items || []); }
    catch { setFailed(true); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadTours(); }, [loadTours]);

  const mutateTour = async (tour: Tour, action: "toggle" | "delete") => {
    if (mutationIds.current.has(tour.tour_id)) return;
    mutationIds.current.add(tour.tour_id);
    setPendingIds([...mutationIds.current]);
    if (action === "toggle") setItems(current => current.map(item => item.tour_id === tour.tour_id ? { ...item, status: tour.status === 1 ? 0 : 1 } : item));
    try {
      if (action === "delete") {
        await deleteAdminTour(tour.tour_id);
        setItems(current => current.filter(item => item.tour_id !== tour.tour_id));
        setPendingDeleteTour(null); success("Đã xóa tour thành công");
      } else {
        await toggleAdminTourStatus(tour.tour_id);
        success(`Đã ${tour.status === 1 ? "tạm ẩn" : "kích hoạt"} tour thành công`);
      }
    } catch (error) {
      if (action === "toggle") setItems(current => current.map(item => item.tour_id === tour.tour_id ? { ...item, status: tour.status } : item));
      showError(error instanceof Error ? error.message : "Không thể cập nhật tour. Vui lòng thử lại.");
    } finally { mutationIds.current.delete(tour.tour_id); setPendingIds([...mutationIds.current]); }
  };

  const filtered = useMemo(() => filterManagedTours(items, filters), [items, filters]);
  const countries = useMemo(() => [...new Map(items.flatMap(tour => tour.countries ?? []).map(country => [country.location_id, country])).values()].sort((a, b) => a.name.localeCompare(b.name, "vi")), [items]);

  return <div className="ui-tour-management-page flex flex-col gap-[12px] text-[#102249] min-w-0 [&_:is(a,_button,_input):focus-visible]:[outline:2px_solid_#3b82f6] [&_:is(a,_button,_input):focus-visible]:outline-offset-[3px]">
    <TourManagementHeader />
    <TourManagementStats items={items} loading={loading} />
    <TourManagementFilters value={filters} onChange={setFilters} countries={countries} />
    {failed ? <div role="alert" className="ui-tour-management-error flex gap-[12px] items-center justify-between [border:1px_solid_#fecdd3] [background:#fff1f2] p-[16px] rounded-[12px] text-[#be123c] text-[13px] [&_button]:font-bold [&_button]:underline"><span>Không thể tải danh sách tour. Vui lòng thử lại.</span><button type="button" onClick={() => void loadTours()}>Tải lại</button></div> : <TourManagementTable key={JSON.stringify(filters)} items={filtered} loading={loading} pendingIds={pendingIds} onToggle={tour => void mutateTour(tour, "toggle")} onDelete={setPendingDeleteTour} />}
    <ConfirmDialog open={pendingDeleteTour !== null} icon={<AlertTriangle size={32} />} title="Xóa tour?" description={`Tour "${pendingDeleteTour?.name || ""}" sẽ bị xóa nếu chưa phát sinh khách đặt ở các lịch khởi hành liên quan.`} confirmLabel={pendingDeleteTour && pendingIds.includes(pendingDeleteTour.tour_id) ? "Đang xóa..." : "Xác nhận xóa"} cancelLabel="Hủy bỏ" onConfirm={() => { if (pendingDeleteTour) void mutateTour(pendingDeleteTour, "delete"); }} onCancel={() => { if (!pendingDeleteTour || !pendingIds.includes(pendingDeleteTour.tour_id)) setPendingDeleteTour(null); }} />
  </div>;
}
