"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  Gift,
  HelpCircle,
  LayoutDashboard,
  Loader2,
  Plus,
  Save,
  Search,
  Sparkles,
  Ticket,
  Trash2,
} from "lucide-react";
import { getAdminHomeVoucherConfig, getAdminVouchers, saveAdminHomeVoucherConfig } from "@/lib/admin/vouchers/api";
import { useToast } from "@/lib/notifications/useToast";
import { formatVND } from "@/lib/utils/currency";
import { HomeVoucherCard } from "@/components/home/vouchers/HomeVoucherCard";
import { HomeVoucherDetailModal } from "@/components/home/vouchers/HomeVoucherDetailModal";
import type { HomeVoucherCampaignConfig, Voucher } from "shared";

function cleanVND(val: number | string | null | undefined) {
  return formatVND(val).replace(/\s*đ/, "đ");
}

export function HomeVoucherCampaignManager() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [search, setSearch] = useState("");
  const [previewVoucherModal, setPreviewVoucherModal] = useState<Voucher | null>(null);

  // Campaign state
  const [enabled, setEnabled] = useState(true);
  const [title, setTitle] = useState("SĂN VOUCHER ƯU ĐÃI");
  const [subtitle, setSubtitle] = useState("Nhận ngay các mã giảm giá hấp dẫn dành riêng cho chuyến du lịch của bạn!");
  const [badge, setBadge] = useState("ƯU ĐÃI ĐẶC BIỆT");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([getAdminHomeVoucherConfig(), getAdminVouchers()])
      .then(([configData, vouchersData]) => {
        if (!active) return;
        setEnabled(configData.enabled);
        setTitle(configData.title || "SĂN VOUCHER ƯU ĐÃI");
        setSubtitle(configData.subtitle || "Nhận ngay các mã giảm giá hấp dẫn dành riêng cho chuyến du lịch của bạn!");
        setBadge(configData.badge || "ƯU ĐÃI ĐẶC BIỆT");
        setSelectedIds(configData.voucher_ids || []);
        setVouchers(vouchersData || []);
      })
      .catch((err) => {
        if (!active) return;
        toast.error(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu voucher trang chủ");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAdminHomeVoucherConfig({
        enabled,
        title,
        subtitle,
        badge,
        voucher_ids: selectedIds,
      });
      toast.success("Đã lưu cấu hình khu vực voucher trang chủ thành công!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  const toggleSelectVoucher = (voucherId: number) => {
    setSelectedIds((prev) =>
      prev.includes(voucherId) ? prev.filter((id) => id !== voucherId) : [...prev, voucherId]
    );
  };

  const moveOrder = (index: number, direction: "up" | "down") => {
    setSelectedIds((prev) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  const selectedVouchers = selectedIds
    .map((id) => vouchers.find((v) => v.voucher_id === id))
    .filter(Boolean) as Voucher[];

  const availableVouchers = vouchers.filter(
    (v) =>
      v.status === 1 &&
      (v.code.toLowerCase().includes(search.toLowerCase()) ||
        (v.name && v.name.toLowerCase().includes(search.toLowerCase())))
  );

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-100 bg-white p-8">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={24} className="animate-spin text-blue-600" />
          <span>Đang tải cấu hình voucher trang chủ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-sky-50/50 to-indigo-50/60 p-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Gift size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Cấu hình Voucher Hiển thị Trang chủ
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Quản lý tiêu đề chiến dịch và danh sách các mã ưu đãi hiển thị cho khách hàng trên trang chủ website.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{saving ? "Đang lưu..." : "Lưu cấu hình"}</span>
        </button>
      </div>

      <div className="grid gap-3 grid-cols-1 lg:grid-cols-2 items-stretch">
        {/* Left Column: Settings & Selector */}
        <div className="flex h-full flex-col justify-start gap-3">
          {/* Card 1: Toggle & Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Trạng thái hiển thị trên Trang chủ</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bật để hiện khu vực voucher dưới thanh tìm kiếm tour; Tắt khi kết thúc chiến dịch.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Huy hiệu sự kiện (Badge)
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="VD: ƯU ĐÃI ĐẶC BIỆT, SIÊU SALE HÈ..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề chính (Title)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: SĂN VOUCHER ƯU ĐÃI"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả / Thông điệp phụ (Subtitle)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="VD: Nhận ngay các mã giảm giá hấp dẫn dành riêng cho chuyến du lịch của bạn!"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Vouchers Selection */}
          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Chọn Voucher Hiển thị ({selectedIds.length} đã chọn)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tích chọn các mã voucher đang hoạt động bạn muốn đưa lên trang chủ.
                </p>
              </div>

              <div className="relative w-full sm:w-56">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm mã hoặc tên..."
                  className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {availableVouchers.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500">
                  Không tìm thấy voucher hoạt động phù hợp.
                </p>
              ) : (
                availableVouchers.map((voucher) => {
                  const isChecked = selectedIds.includes(voucher.voucher_id);
                  const discountLabel =
                    voucher.discount_type === "percentage"
                      ? `Giảm ${voucher.discount_value}%`
                      : `Giảm ${cleanVND(voucher.discount_value)}`;

                  return (
                    <label
                      key={voucher.voucher_id}
                      className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                        isChecked
                          ? "border-blue-400 bg-blue-50/70"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectVoucher(voucher.voucher_id)}
                          className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                              {voucher.code}
                            </span>
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {voucher.name || discountLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {discountLabel} · Đơn từ {cleanVND(voucher.min_order_value)} · HSD:{" "}
                            {new Date(voucher.expiry_date).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold text-slate-400 shrink-0 ml-2">
                        {voucher.used_count}/{voucher.usage_limit} lượt
                      </span>
                    </label>
                  );
                })
              )}
            </div>

            {selectedIds.length === 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-xl p-3 border border-amber-200">
                * Lưu ý: Nếu không chọn voucher nào cụ thể, hệ thống sẽ tự động hiển thị 6 voucher có mức giảm lớn nhất đang còn hiệu lực.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Reorder & Live Preview */}
        <div className="flex h-full flex-col justify-between gap-3">
          {/* Order List Card */}
          <div className="flex h-[440px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Thứ tự hiển thị trên Trang chủ
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dùng mũi tên lên / xuống để thay đổi thứ tự xuất hiện từ trái qua phải.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                {selectedVouchers.length} vị trí
              </span>
            </div>

            {selectedVouchers.length === 0 ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-7 text-center text-xs text-slate-400">
                <Ticket size={24} className="mb-2 text-slate-300" />
                <span className="font-medium text-slate-600">Chưa có voucher nào được chọn</span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Tích chọn các voucher ở cột bên trái để gán thứ tự ưu tiên hiển thị.
                </span>
              </div>
            ) : (
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 pt-1">
                {selectedVouchers.map((v, idx) => (
                  <div
                    key={v.voucher_id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs transition-colors hover:bg-slate-100/70"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                        {idx + 1}
                      </span>
                      <span className="font-mono font-bold text-slate-900 truncate">
                        {v.code}
                      </span>
                      <span className="text-slate-500 truncate">({v.name || "Voucher"})</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveOrder(idx, "up")}
                        className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                        title="Di chuyển lên trước"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === selectedVouchers.length - 1}
                        onClick={() => moveOrder(idx, "down")}
                        className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                        title="Di chuyển xuống sau"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSelectVoucher(v.voucher_id)}
                        className="rounded p-1 text-rose-500 hover:bg-rose-50"
                        title="Bỏ chọn"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Preview Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Eye size={16} className="text-blue-600" />
                Xem trước giao diện thẻ voucher
              </h3>
              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Live Preview
              </span>
            </div>

            <div className="pt-0 flex justify-center overflow-x-auto pb-1">
              {selectedVouchers.length > 0 ? (
                <HomeVoucherCard
                  voucher={selectedVouchers[0]}
                  onOpenDetail={(v) => setPreviewVoucherModal(v)}
                />
              ) : availableVouchers.length > 0 ? (
                <HomeVoucherCard
                  voucher={availableVouchers[0]}
                  onOpenDetail={(v) => setPreviewVoucherModal(v)}
                />
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">
                  Chưa có dữ liệu voucher để hiển thị mẫu.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {previewVoucherModal && (
        <HomeVoucherDetailModal
          voucher={previewVoucherModal}
          onClose={() => setPreviewVoucherModal(null)}
        />
      )}
    </div>
  );
}

