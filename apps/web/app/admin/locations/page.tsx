"use client";

import { LocationManagementHeader } from "@/components/locations/location_management/AdminLocationManagementHeader";
import { LocationManagementStats } from "@/components/locations/location_management/AdminLocationManagementStats";
import { LocationManagementFilters } from "@/components/locations/location_management/AdminLocationManagementFilters";
import { LocationManagementTable } from "@/components/locations/location_management/AdminLocationManagementTable";

import { ConfirmDialog } from "@/components/common/dialogs_and_feedback/dialogs/ConfirmDialog";
import {
  deleteAdminLocation,
  getAdminLocationLevels,
  getAdminLocations,
} from "@/lib/locations/admin/api";
import {
  DEFAULT_LOCATION_FILTERS,
  filterManagedLocations,
} from "@/lib/locations/admin/management";
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
      setPendingDelete(null);
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
    <div className="ui-location-management-page space-y-3 min-w-0 text-[#15284d]">
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
          className="ui-location-management-error flex items-center justify-between gap-3 rounded-[14px] border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-700 shadow-2xs"
        >
          <span>Không thể tải danh sách địa điểm.</span>
          <button
            type="button"
            className="font-bold underline hover:no-underline cursor-pointer"
            onClick={() => void load()}
          >
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
