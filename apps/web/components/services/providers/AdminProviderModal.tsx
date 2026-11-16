"use client";

import { useEffect, useState } from "react";
import { AdminModalShell } from "@/components/common/admin_shared/layout/AdminModalShell";
import { Building2, Loader2 } from "lucide-react";
import type { AdminProvider, ProviderPayload } from "shared";

interface ProviderModalProps {
  open: boolean;
  provider: AdminProvider | null;
  onClose: () => void;
  onSubmit: (data: ProviderPayload) => Promise<void>;
}

export function ProviderModal({
  open,
  provider,
  onClose,
  onSubmit,
}: ProviderModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("car");
  const [contactInfo, setContactInfo] = useState("");
  const [status, setStatus] = useState<number>(1);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (provider) {
      setName(provider.name || "");
      setType(provider.type || "car");
      setContactInfo(provider.contact_info || "");
      setStatus(typeof provider.status === "number" ? provider.status : 1);
    } else {
      setName("");
      setType("car");
      setContactInfo("");
      setStatus(1);
    }
    setError(null);
  }, [provider, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên nhà cung cấp.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        type,
        contact_info: contactInfo.trim() || null,
        status,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminModalShell
      title={provider ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}
      icon={<Building2 size={22} />}
      onClose={onClose}
      maxWidthClassName="max-w-md"
      footer={
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {provider ? "Lưu thay đổi" : "Tạo đối tác"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Tên đối tác / Nhà cung cấp <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Vietnam Airlines, Xe Phương Trang..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Lĩnh vực cung cấp
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="car">Vận chuyển ô tô / xe khách</option>
            <option value="airline">Hãng hàng không (Flight)</option>
            <option value="train">Đường sắt / Tàu hỏa</option>
            <option value="boat">Tàu du lịch / Du thuyền</option>
            <option value="hotel">Khách sạn / Lưu trú</option>
            <option value="other">Dịch vụ khác</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Thông tin liên hệ
          </label>
          <textarea
            rows={3}
            placeholder="Hotline: 1900 1234&#10;Email: dieuhanh@doitac.com&#10;Người liên hệ: Anh Hùng"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Trạng thái hợp tác
          </label>
          <div className="flex gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="providerStatus"
                value={1}
                checked={status === 1}
                onChange={() => setStatus(1)}
                className="text-blue-600"
              />
              <span className="text-sm font-semibold text-slate-800">Đang hợp tác</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="providerStatus"
                value={0}
                checked={status === 0}
                onChange={() => setStatus(0)}
                className="text-blue-600"
              />
              <span className="text-sm font-semibold text-slate-500">Tạm dừng</span>
            </label>
          </div>
        </div>
      </form>
    </AdminModalShell>
  );
}

