"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/components/common/admin_shared/layout/AdminPageHeader";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { AdminSearchInput } from "@/components/common/admin_shared/tables/AdminSearchInput";
import { BannerManagementTable } from "@/components/banners/banner_management/AdminBannerManagementTable";
import { SeasonalThemeManager } from "@/components/banners/seasonal_theme/AdminSeasonalThemeManager";
import { FeaturedLocationsManager } from "@/components/locations/featured_locations/AdminFeaturedLocationsManager";
import { deleteAdminBanner, fetchAdminBanners, saveAdminBanner, updateAdminBannerStatus } from "@/lib/banners/admin/api";
import { useToast } from "@/lib/notifications/useToast";
import { Images, MapPin, Sparkles } from "lucide-react";
import type { Banner } from "shared";

type BannersTab = "list" | "featured" | "seasonal";

export default function AdminBannersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-100 bg-white p-8">
          <div className="text-sm font-medium text-slate-500">Đang tải quản lý banner &amp; giao diện…</div>
        </div>
      }
    >
      <AdminBannersContent />
    </Suspense>
  );
}

function AdminBannersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError } = useToast();

  const tabParam = searchParams.get("tab");
  const initialTab: BannersTab =
    tabParam === "featured" || tabParam === "destinations"
      ? "featured"
      : tabParam === "seasonal" || tabParam === "theme"
      ? "seasonal"
      : "list";

  const [activeTab, setActiveTab] = useState<BannersTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Banner[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());
  const pending = useRef(new Set<number>());

  useEffect(() => {
    if (tabParam === "featured" || tabParam === "destinations") {
      setActiveTab("featured");
    } else if (tabParam === "seasonal" || tabParam === "theme") {
      setActiveTab("seasonal");
    } else if (!tabParam) {
      setActiveTab("list");
    }
  }, [tabParam]);

  const handleTabChange = (nextTab: BannersTab) => {
    setActiveTab(nextTab);
    const params = new URLSearchParams(searchParams.toString());
    if (nextTab === "list") {
      params.delete("tab");
    } else {
      params.set("tab", nextTab);
    }
    const qs = params.toString();
    router.replace(`/admin/banners${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchAdminBanners());
    } catch {
      showError("Không tải được danh sách banner");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const run = async (item: Banner, task: () => Promise<void>) => {
    if (pending.current.has(item.banner_id)) return;
    pending.current.add(item.banner_id);
    setBusyIds(new Set(pending.current));
    try {
      await task();
    } catch (e) {
      showError(e instanceof Error ? e.message : "Không thực hiện được thao tác");
    } finally {
      pending.current.delete(item.banner_id);
      setBusyIds(new Set(pending.current));
    }
  };

  const toggle = (item: Banner) =>
    void run(item, async () => {
      const next = item.status === 1 ? 0 : 1;
      await updateAdminBannerStatus(item.banner_id, next);
      setItems((current) =>
        current.map((row) => (row.banner_id === item.banner_id ? { ...row, status: next } : row))
      );
      success(next === 1 ? "Đã hiển thị banner" : "Đã ẩn banner");
    });

  const duplicate = (item: Banner) =>
    void run(item, async () => {
      const created = await saveAdminBanner({
        location_name: item.location_name,
        header: `${item.header.slice(0, 240)} (bản sao)`,
        description: item.description,
        image_url: item.image_url,
        link_to: item.link_to || "",
        status: 0,
      });
      setItems((current) => [...current, created].sort((a, b) => a.banner_id - b.banner_id));
      success("Đã nhân bản banner ở trạng thái ẩn");
    });

  const remove = (item: Banner) => {
    if (!window.confirm(`Xóa banner “${item.header}”?`)) return;
    void run(item, async () => {
      await deleteAdminBanner(item.banner_id);
      setItems((current) => current.filter((row) => row.banner_id !== item.banner_id));
      success("Đã xóa banner");
    });
  };

  const bulkStatus = async (ids: number[], next: number) => {
    const targets = items.filter((item) => ids.includes(item.banner_id) && item.status !== next);
    await Promise.all(
      targets.map((item) =>
        run(item, async () => {
          await updateAdminBannerStatus(item.banner_id, next);
          setItems((current) =>
            current.map((row) => (row.banner_id === item.banner_id ? { ...row, status: next } : row))
          );
        })
      )
    );
  };

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (status === "ALL" || String(item.status) === status) &&
          `${item.header} ${item.location_name} ${item.description}`
            .toLocaleLowerCase("vi")
            .includes(search.trim().toLocaleLowerCase("vi"))
      ),
    [items, status, search]
  );

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quản lý Banner & Giao diện"
        description="Quản lý hình ảnh banner, địa điểm yêu thích và cấu hình hiệu ứng 4 mùa trên trang chủ."
        primaryAction={
          activeTab === "list"
            ? {
                label: "Thêm banner mới",
                onClick: () => router.push("/admin/banners/new"),
              }
            : undefined
        }
      />

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => handleTabChange("list")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
            activeTab === "list"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
          }`}
        >
          <Images size={16} />
          Danh sách banner ({items.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("featured")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
            activeTab === "featured"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
          }`}
        >
          <MapPin size={16} className={activeTab === "featured" ? "text-blue-600" : "text-rose-500"} />
          Địa điểm yêu thích
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("seasonal")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
            activeTab === "seasonal"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
          }`}
        >
          <Sparkles size={16} className={activeTab === "seasonal" ? "text-amber-500" : "text-amber-500"} />
          Hiệu ứng & Giao diện 4 Mùa
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <AdminSearchInput
                value={search}
                onChange={setSearch}
                placeholder="Tìm tiêu đề, mô tả hoặc địa điểm…"
              />
            </div>
            <CustomDropdown
              variant="compact"
              matchTriggerWidth
              selectedValue={status}
              onSelect={setStatus}
              options={[
                { value: "ALL", label: "Tất cả trạng thái" },
                { value: "1", label: "Đang hiển thị" },
                { value: "0", label: "Đang ẩn" },
              ]}
              className="w-full sm:w-[210px]"
            />
          </div>
          <BannerManagementTable
            items={filtered}
            loading={loading}
            busyIds={busyIds}
            onToggle={toggle}
            onDuplicate={duplicate}
            onDelete={remove}
            onBulkStatus={bulkStatus}
          />
        </div>
      )}

      {activeTab === "featured" && <FeaturedLocationsManager />}

      {activeTab === "seasonal" && <SeasonalThemeManager />}
    </div>
  );
}
