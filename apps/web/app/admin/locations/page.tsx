"use client";

import { LocationManagementHeader } from "@/components/admin/locations/LocationManagementHeader";
import { LocationManagementStats } from "@/components/admin/locations/LocationManagementStats";
import { LocationManagementFilters } from "@/components/admin/locations/LocationManagementFilters";
import { LocationManagementTable } from "@/components/admin/locations/LocationManagementTable";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  deleteAdminLocation,
  getAdminLocationLevels,
  getAdminLocations,
} from "@/lib/admin/locations/api";
import {
  DEFAULT_LOCATION_FILTERS,
  filterManagedLocations,
} from "@/lib/admin/locations/management";
import { useToast } from "@/lib/notifications/useToast";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LocationItem, LocationLevel } from "shared";

export default function AdminLocationsPage() {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [items, setItems] = useState<LocationItem[]>([]);
  const [levels, setLevels] = useState<LocationLevel[]>([]);
  const [filters, setFilters] = useState({ ...DEFAULT_LOCATION_FILTERS });
  const [pendingDelete, setPendingDelete] = useState<LocationItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const deleting = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const [locations, levelData] = await Promise.all([
        getAdminLocations<LocationItem>(),
        getAdminLocationLevels<LocationLevel>(),
      ]);
      setItems(locations.items ?? []);
      setLevels(levelData);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const confirmDelete = async () => {
    if (!pendingDelete || deleting.current) return;
    const id = pendingDelete.location_id;
    deleting.current = true;
    setDeletingId(id);
    try {
      await deleteAdminLocation(id);
      setItems((current) => current.filter((item) => item.location_id !== id));
      setPendingDelete(null);
      success("Đã xóa địa điểm thành công");
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Không thể xóa địa điểm. Vui lòng thử lại.",
      );
    } finally {
      deleting.current = false;
      setDeletingId(null);
    }
  };
  const filtered = useMemo(
    () => filterManagedLocations(items, filters),
    [items, filters],
  );
  const regions = useMemo(
    () =>
      items
        .filter((item) => item.level_id === 4)
        .sort((a, b) => a.name.localeCompare(b.name, "vi")),
    [items],
  );

  return (
    <div className="ui-location-management-page flex flex-col gap-[14px] min-w-0 text-[#15284d] [&_:is(button,input,select,a):focus-visible]:[outline:2px_solid_#3b82f6] [&_:is(button,input,select,a):focus-visible]:outline-offset-[2px]">
      <LocationManagementHeader />
      <LocationManagementStats items={items} loading={loading} />
      <LocationManagementFilters
        value={filters}
        onChange={setFilters}
        levels={levels}
        regions={regions}
      />
      {failed ? (
        <div
          role="alert"
          className="ui-location-management-error flex justify-between gap-[12px] [border:1px_solid_#fecdd3] text-[#bd3650] [background:#fff1f3] p-[15px] rounded-[12px] text-[13px] [&_button]:font-bold [&_button]:underline"
        >
          <span>Không thể tải danh sách địa điểm.</span>
          <button type="button" onClick={() => void load()}>
            Tải lại
          </button>
        </div>
      ) : (
        <LocationManagementTable
          key={JSON.stringify(filters)}
          items={filtered}
          loading={loading}
          deletingId={deletingId}
          onDelete={setPendingDelete}
        />
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        icon={<Trash2 size={28} />}
        title="Xác nhận xóa địa điểm"
        description={
          pendingDelete
            ? `Địa điểm "${pendingDelete.name}" sẽ bị xóa vĩnh viễn nếu không còn liên kết dữ liệu. Hệ thống sẽ chặn khi địa điểm còn địa điểm con, được tour sử dụng hoặc có khách sạn liên kết.`
            : ""
        }
        confirmLabel={deletingId !== null ? "Đang xóa..." : "Xóa địa điểm"}
        cancelLabel="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleting.current) setPendingDelete(null);
        }}
      />
    </div>
  );
}
