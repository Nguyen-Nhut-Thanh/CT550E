"use client";

import { useEffect, useState } from "react";
import { AdminModalShell } from "@/components/common/admin_shared/layout/AdminModalShell";
import { Bus, Car, Loader2, Plane, Ship, Train } from "lucide-react";
import type { AdminProvider, AdminTransport, TransportPayload } from "shared";

interface TransportModalProps {
  open: boolean;
  transport: AdminTransport | null;
  providers: AdminProvider[];
  onClose: () => void;
  onSubmit: (data: TransportPayload) => Promise<void>;
}

export function TransportModal({
  open,
  transport,
  providers,
  onClose,
  onSubmit,
}: TransportModalProps) {
  const [name, setName] = useState("");
  const [transportType, setTransportType] = useState("car");
  const [capacity, setCapacity] = useState<number>(45);
  const [providerId, setProviderId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<number>(1);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transport) {
      setName(transport.name || "");
      setTransportType(transport.transport_type || "car");
      setCapacity(transport.capacity || 0);
      setProviderId(transport.provider_id || "");
      setDescription(transport.description || "");
      setStatus(typeof transport.status === "number" ? transport.status : 1);
    } else {
      setName("");
      setTransportType("car");
      setCapacity(45);
      setProviderId(providers[0]?.provider_id || "");
      setDescription("");
      setStatus(1);
    }
    setError(null);
  }, [transport, open, providers]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên phương tiện.");
      return;
    }
    if (!providerId) {
      setError("Vui lòng chọn đơn vị cung cấp.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        transport_type: transportType,
        capacity: Number(capacity) || 0,
        provider_id: Number(providerId),
        status,
        description: description.trim() || null,
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
      title={transport ? "Chỉnh sửa phương tiện" : "Thêm phương tiện mới"}
      icon={<Car size={22} />}
      onClose={onClose}
      maxWidthClassName="max-w-xl"
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
            {transport ? "Lưu thay đổi" : "Tạo phương tiện"}
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
            Tên phương tiện <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Xe Hyundai Universe 45 chỗ, Airbus A321..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Loại phương tiện
            </label>
            <select
              value={transportType}
              onChange={(e) => setTransportType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="car">Xe ô tô / Xe khách</option>
              <option value="flight">Máy bay (Hàng không)</option>
              <option value="train">Tàu hỏa (Đường sắt)</option>
              <option value="boat">Tàu thủy / Du thuyền</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Sức chứa (Số chỗ ngồi)
            </label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value) || 0)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Đơn vị / Đối tác cung cấp <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={providerId}
            onChange={(e) => setProviderId(Number(e.target.value) || "")}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Chọn đối tác cung cấp</option>
            {providers.map((p) => (
              <option key={p.provider_id} value={p.provider_id}>
                {p.name} ({p.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Trạng thái hoạt động
          </label>
          <div className="flex gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="transportStatus"
                value={1}
                checked={status === 1}
                onChange={() => setStatus(1)}
                className="text-blue-600"
              />
              <span className="text-sm font-semibold text-slate-800">Hoạt động (sẵn sàng gán tour)</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="transportStatus"
                value={0}
                checked={status === 0}
                onChange={() => setStatus(0)}
                className="text-blue-600"
              />
              <span className="text-sm font-semibold text-slate-500">Tạm dừng</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Mô tả tiện ích xe / máy bay
          </label>
          <textarea
            rows={2}
            placeholder="Ví dụ: Ghế da cao cấp, wifi tốc độ cao, nước uống miễn phí, điều hòa mát lạnh..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </form>
    </AdminModalShell>
  );
}

