"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VoucherModal } from "@/components/admin/vouchers/VoucherModal";
import { VoucherStatusFilterTabs } from "@/components/admin/vouchers/VoucherStatusFilterTabs";
import { HomeVoucherCampaignManager } from "@/components/admin/vouchers/HomeVoucherCampaignManager";
import { VoucherManagementTable } from "@/components/admin/vouchers/VoucherManagementTable";
import { AdminPageHeader } from "@/components/admin/common/AdminPageHeader";
import { AdminSearchInput } from "@/components/admin/common/AdminSearchInput";
import { ConfirmDialog } from "@/components/common/overlays/ConfirmDialog";
import {
  createAdminVoucher,
  deleteAdminVoucher,
  getAdminVouchers,
  setAdminVoucherStatus,
} from "@/lib/admin/vouchers/api";
import {
  buildVoucherForm,
  buildVoucherPayload,
  createDefaultVoucherForm,
  filterVouchers,
  getVoucherDateParts,
} from "@/lib/admin/vouchers/forms";
import { useToast } from "@/lib/notifications/useToast";
import { AlertTriangle, Sparkles, Ticket } from "lucide-react";
import type { Voucher, VoucherForm, VoucherStatusFilter } from "shared";

type VouchersTab = "list" | "campaign";

export default function AdminVouchersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-100 bg-white p-8">
          <div className="text-sm font-medium text-slate-500">Đang tải mã giảm giá…</div>
        </div>
      }
    >
      <AdminVouchersContent />
    </Suspense>
  );
}

function AdminVouchersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab: VouchersTab = tabParam === "campaign" || tabParam === "home" ? "campaign" : "list";

  const [activeTab, setActiveTab] = useState<VouchersTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const busyIds = useRef(new Set<number>());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<VoucherStatusFilter>("all");
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [pendingDeleteVoucher, setPendingDeleteVoucher] = useState<Voucher | null>(null);
  const [form, setForm] = useState<VoucherForm>(createDefaultVoucherForm);
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (tabParam === "campaign" || tabParam === "home") {
      setActiveTab("campaign");
    } else {
      setActiveTab("list");
    }
  }, [tabParam]);

  const handleTabChange = (nextTab: VouchersTab) => {
    setActiveTab(nextTab);
    const params = new URLSearchParams(searchParams.toString());
    if (nextTab === "list") {
      params.delete("tab");
    } else {
      params.set("tab", nextTab);
    }
    const qs = params.toString();
    router.replace(`/admin/marketing/vouchers${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const isReadonlyVoucher = !!editingVoucher;
  const { minDate, minTime, startDateValue, startTimeValue } =
    getVoucherDateParts(form.start_date);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      setVouchers(await getAdminVouchers());
    } catch {
      showError("Lỗi tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredVouchers = useMemo(
    () => filterVouchers(vouchers, searchTerm, statusFilter),
    [vouchers, searchTerm, statusFilter]
  );

  const openVoucherModal = (voucher: Voucher | null = null) => {
    setEditingVoucher(voucher);
    setForm(voucher ? buildVoucherForm(voucher) : createDefaultVoucherForm());
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVoucher(null);
    setForm(createDefaultVoucherForm());
  };

  const handleSaveVoucher = async () => {
    if (saving) return;
    if (!form.customer_types.length) {
      showError("Vui lòng chọn ít nhất một đối tượng áp dụng");
      return;
    }
    if (editingVoucher) {
      closeModal();
      return;
    }

    setSaving(true);
    try {
      await createAdminVoucher(buildVoucherPayload(form));
      success("Tạo voucher thành công");
      closeModal();
      void loadData();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Lỗi khi lưu voucher");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVoucher = async (voucher: Voucher) => {
    if (busyIds.current.has(voucher.voucher_id)) return;
    busyIds.current.add(voucher.voucher_id);

    const nextStatus = voucher.status === 1 ? 0 : 1;
    try {
      await setAdminVoucherStatus(voucher.voucher_id, nextStatus);
      success(nextStatus === 1 ? "Đã mở khóa voucher" : "Đã tạm khóa voucher");
      void loadData();
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Không thể thay đổi trạng thái voucher"
      );
    } finally {
      busyIds.current.delete(voucher.voucher_id);
    }
  };

  const handleDeleteVoucher = async (voucher: Voucher) => {
    try {
      await deleteAdminVoucher(voucher.voucher_id);
      success("Đã xóa voucher thành công");
      setPendingDeleteVoucher(null);
      void loadData();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Không thể xóa voucher");
    }
  };

  const handleStartDateChange = (date: string) => {
    setForm((current) => {
      const parts = getVoucherDateParts(current.start_date);
      const nextTime = parts.startTimeValue || "00:00";
      return {
        ...current,
        start_date: date ? `${date}T${nextTime}:00` : "",
      };
    });
  };

  const handleStartTimeChange = (time: string) => {
    setForm((current) => {
      const parts = getVoucherDateParts(current.start_date);
      const nextDate = parts.startDateValue || "";
      return {
        ...current,
        start_date: nextDate ? `${nextDate}T${time}:00` : "",
      };
    });
  };

  return (
    <div className="relative space-y-5">
      <AdminPageHeader
        title="Mã giảm giá &amp; Ưu đãi"
        description="Quản lý các chương trình ưu đãi mã khuyến mãi và chiến dịch voucher sự kiện trang chủ."
        primaryAction={
          activeTab === "list"
            ? {
                label: "Tạo mã mới",
                onClick: () => openVoucherModal(),
              }
            : undefined
        }
      />

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => handleTabChange("list")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "list"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
          }`}
        >
          <Ticket size={16} />
          Danh sách voucher ({vouchers.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("campaign")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "campaign"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
          }`}
        >
          <Sparkles size={16} className="text-amber-500" />
          Voucher hiển thị Trang chủ
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <AdminSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Tìm theo mã voucher..."
          />

          <VoucherStatusFilterTabs
            value={statusFilter}
            onChange={setStatusFilter}
          />

          <VoucherManagementTable
            vouchers={filteredVouchers}
            loading={loading}
            onView={(v) => openVoucherModal(v)}
            onToggleStatus={(v) => void handleToggleVoucher(v)}
            onDelete={(v) => setPendingDeleteVoucher(v)}
          />
        </div>
      )}

      {activeTab === "campaign" && <HomeVoucherCampaignManager />}

      <VoucherModal
        open={showModal}
        saving={saving}
        readonly={isReadonlyVoucher}
        form={form}
        minDate={minDate}
        minTime={minTime}
        startDateValue={startDateValue}
        startTimeValue={startTimeValue}
        title={editingVoucher ? "Chi tiết voucher" : "Tạo voucher mới"}
        onClose={closeModal}
        onSave={handleSaveVoucher}
        onChange={(updater) => setForm((current) => updater(current))}
        onStartDateChange={handleStartDateChange}
        onStartTimeChange={handleStartTimeChange}
      />

      <ConfirmDialog
        open={pendingDeleteVoucher !== null}
        icon={<AlertTriangle size={32} />}
        title="Xóa voucher?"
        description="Voucher này sẽ bị xóa khỏi hệ thống. Hành động này không thể hoàn tác."
        confirmLabel="Xác nhận xóa"
        cancelLabel="Hủy bỏ"
        onConfirm={() => {
          if (pendingDeleteVoucher) {
            void handleDeleteVoucher(pendingDeleteVoucher);
          }
        }}
        onCancel={() => setPendingDeleteVoucher(null)}
      />
    </div>
  );
}
