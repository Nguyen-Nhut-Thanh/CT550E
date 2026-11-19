"use client";

import { AdminStatGrid } from "@/components/common/admin_shared/cards/AdminStatGrid";

import { useAdminContentReadOnly } from "@/components/common/admin_shared/guards/AdminContentPermission";
import { FeaturedLocationsLeftPanel } from "@/components/locations/featured_locations/AdminFeaturedLocationsLeftPanel";
import { FeaturedLocationsRightPanel } from "@/components/locations/featured_locations/AdminFeaturedLocationsRightPanel";
import { getAdminLocations, updateAdminLocation } from "@/lib/locations/admin/api";
import {
  FEATURED_LIMIT,
  filterFeaturedTabs,
  filterRegionChildren,
  getCurrentFeatured,
} from "@/lib/locations/admin/featured";
import { useToast } from "@/lib/notifications/useToast";
import { ArrowLeft, Info, Loader2, MapPin, Save, Tag, Star, LayoutGrid, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminLocationItem } from "shared";

export function FeaturedLocationsManager({ showBackBtn = false }: { showBackBtn?: boolean }) {
  const readOnly = useAdminContentReadOnly();
  const router = useRouter();
  const { success, error: showError, warning } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const request = useRef(0);
  const [loadError, setLoadError] = useState("");
  const [regions, setRegions] = useState<AdminLocationItem[]>([]);
  const [activeRegionId, setActiveRegionId] = useState<number | null>(null);
  const [allChildren, setAllChildren] = useState<AdminLocationItem[]>([]);
  const [featured, setFeatured] = useState<AdminLocationItem[]>([]);

  const syncRegionChildren = useCallback((items: AdminLocationItem[], regionId: number) => {
    const children = filterRegionChildren(items, regionId);
    setActiveRegionId(regionId);
    setAllChildren(children);
    setFeatured(getCurrentFeatured(children));
  }, []);

  const loadInitialData = useCallback(async () => {
    const sequence = ++request.current;
    setLoading(true);
    setLoadError("");
    try {
      const data = await getAdminLocations<AdminLocationItem>();
      if (sequence !== request.current) return;
      const items = data.items || [];
      const tabs = filterFeaturedTabs(items);
      setRegions(tabs);
      if (tabs.length) {
        syncRegionChildren(items, tabs[0].location_id);
      } else {
        setActiveRegionId(null);
        setAllChildren([]);
        setFeatured([]);
      }
    } catch (error) {
      if (sequence === request.current) {
        setLoadError(error instanceof Error ? error.message : "Không thể tải địa điểm yêu thích.");
      }
    } finally {
      if (sequence === request.current) setLoading(false);
    }
  }, [syncRegionChildren]);

  const loadRegionChildren = useCallback(
    async (regionId: number) => {
      const sequence = ++request.current;
      setLoading(true);
      setLoadError("");
      try {
        const data = await getAdminLocations<AdminLocationItem>();
        if (sequence === request.current) {
          syncRegionChildren(data.items || [], regionId);
        }
      } catch (error) {
        if (sequence === request.current) {
          setLoadError(error instanceof Error ? error.message : "Không thể tải địa điểm của miền này.");
        }
      } finally {
        if (sequence === request.current) setLoading(false);
      }
    },
    [syncRegionChildren]
  );

  useEffect(() => {
    void loadInitialData();
    return () => {
      request.current++;
    };
  }, [loadInitialData]);

  const toggleSelect = (location: AdminLocationItem) => {
    if (loading || saving) return;
    const selected = featured.some((item) => item.location_id === location.location_id);
    if (!selected && featured.length >= FEATURED_LIMIT) {
      showError("Mỗi vùng chỉ được chọn tối đa 9 địa điểm");
      return;
    }
    if (!selected && !location.featured_image && !location.location_images?.some((image) => image.image_url)) {
      warning(`"${location.name}" chưa có ảnh đại diện.`);
    }
    setFeatured((current) =>
      current.some((item) => item.location_id === location.location_id)
        ? current.filter((item) => item.location_id !== location.location_id)
        : current.length >= FEATURED_LIMIT
        ? current
        : [...current, { ...location, is_featured: true, featured_order: current.length + 1 }]
    );
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (loading || saving) return;
    setFeatured((current) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    if (!activeRegionId || loading || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const toReset = allChildren.filter(
        (child) => child.is_featured && !featured.some((item) => item.location_id === child.location_id)
      );
      await Promise.all([
        ...toReset.map((location) =>
          updateAdminLocation(location.location_id, { is_featured: false, featured_order: null })
        ),
        ...featured.map((location, index) =>
          updateAdminLocation(location.location_id, {
            is_featured: true,
            featured_order: index + 1,
            featured_image: location.featured_image,
          })
        ),
      ]);
      success("Đã cập nhật danh sách địa điểm thành công");
      await loadRegionChildren(activeRegionId);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Không thể lưu thiết lập.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (loading && !regions.length) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-[14px] border border-[#e1edfc] bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={24} className="animate-spin text-blue-600" />
          <span className="text-xs sm:text-sm font-medium">Đang tải danh sách địa điểm yêu thích...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Top Banner Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-[14px] border border-[#e1edfc] bg-gradient-to-r from-blue-50/60 via-sky-50/40 to-indigo-50/50 p-4 sm:p-4.5 shadow-2xs">
        <div className="flex items-center gap-3">
          {showBackBtn && (
            <button
              type="button"
              onClick={() => router.push("/admin/locations")}
              aria-label="Quay lại quản lý địa điểm"
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#e1edfc] bg-white text-slate-600 transition hover:bg-blue-50 cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-blue-600 text-white shadow-xs">
            <MapPin size={22} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Quản lý Địa điểm Yêu thích
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Chọn và sắp xếp các điểm đến nổi bật theo từng vùng miền hiển thị trên trang chủ website.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            disabled={saving}
            onClick={() => router.push("/admin/locations")}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[#e1edfc] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            <Tag size={14} />
            Thiết lập tag miền
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={readOnly || saving || loading || !activeRegionId}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{saving ? "Đang lưu..." : "Lưu thiết lập"}</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {loadError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700"
        >
          <span>{loadError}</span>
          <button
            type="button"
            disabled={loading || saving}
            onClick={() => void (activeRegionId ? loadRegionChildren(activeRegionId) : loadInitialData())}
            className="shrink-0 font-bold underline hover:text-rose-900 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loadError && <AdminStatGrid label="Thống kê địa điểm yêu thích trong miền đang chọn" loading={loading} items={[
        { id: "regions", title: "Vùng miền", value: regions.length, icon: MapPin },
        { id: "locations", title: "Địa điểm trong miền", value: allChildren.length, description: regions.find(item => item.location_id === activeRegionId)?.name || "Chưa chọn miền", icon: LayoutGrid, tone: "purple" },
        { id: "selected", title: "Đã chọn hiển thị", value: featured.length, description: "Lựa chọn đang chỉnh sửa của miền", icon: Star, tone: "green" },
        { id: "remaining", title: "Vị trí còn trống", value: Math.max(0, FEATURED_LIMIT - featured.length), description: `Tối đa ${FEATURED_LIMIT} địa điểm mỗi miền`, icon: CheckCircle2, tone: "amber" },
      ]} />}

      {/* Region Selector Pills */}
      {!!regions.length && (
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">Vùng miền:</span>
          <div
            role="group"
            aria-label="Chọn miền hiển thị"
            className="flex shrink-0 gap-1 rounded-xl border border-[#e1edfc] bg-slate-100/70 p-1 shadow-2xs"
          >
            {regions.map((region) => (
              <button
                type="button"
                key={region.location_id}
                disabled={loading || saving}
                aria-pressed={activeRegionId === region.location_id}
                onClick={() => {
                  if (activeRegionId !== region.location_id) void loadRegionChildren(region.location_id);
                }}
                className={`min-h-7.5 min-w-20 rounded-lg px-3.5 py-1 text-xs font-bold transition-all disabled:cursor-wait cursor-pointer ${
                  activeRegionId === region.location_id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No region warning */}
      {!regions.length && !loading && !loadError && (
        <div className="flex items-start gap-3 rounded-[14px] border border-[#e1edfc] bg-white p-4 text-xs sm:text-sm leading-relaxed text-slate-600 shadow-2xs">
          <Info size={18} className="mt-0.5 shrink-0 text-blue-500" />
          <div>
            <h3 className="font-bold text-slate-900">Chưa có miền hiển thị</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Thiết lập các vùng miền nổi bật trong Quản lý địa điểm để chọn địa điểm cho trang chủ.
            </p>
          </div>
        </div>
      )}

      {/* Dual Panel Grid */}
      {!!regions.length && (
        <div
          className="grid min-w-0 grid-cols-1 items-stretch gap-3.5 lg:grid-cols-[minmax(280px,1fr)_minmax(0,1.95fr)]"
          aria-busy={loading}
        >
          <FeaturedLocationsLeftPanel
            allChildren={allChildren}
            featured={featured}
            onToggleSelect={toggleSelect}
            disabled={readOnly || loading || saving}
          />
          <FeaturedLocationsRightPanel
            featured={featured}
            disabled={readOnly || loading || saving}
            onMoveItem={moveItem}
            onReorder={(from, to) =>
              setFeatured((current) => {
                if (loading || saving || from === to || from < 0 || to < 0 || from >= current.length || to >= current.length) {
                  return current;
                }
                const next = [...current];
                const [item] = next.splice(from, 1);
                next.splice(to, 0, item);
                return next;
              })
            }
            onToggleSelect={toggleSelect}
            onImageChange={(index, value) =>
              setFeatured((current) => {
                if (!current[index] || loading || saving) return current;
                const next = [...current];
                next[index] = { ...next[index], featured_image: value };
                return next;
              })
            }
          />
        </div>
      )}
    </div>
  );
}

