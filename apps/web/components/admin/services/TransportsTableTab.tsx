"use client";

import { useMemo, useState } from "react";
import { AdminSearchInput } from "@/components/admin/common/AdminSearchInput";
import { AdminStatusBadge } from "@/components/admin/common/AdminStatusBadge";
import { Bus, Car, Edit2, Plane, Ship, Train, Trash2 } from "lucide-react";
import type { AdminProvider, AdminTransport } from "shared";

export interface TransportsTableTabProps {
  transports: AdminTransport[];
  providers: AdminProvider[];
  onEdit: (transport: AdminTransport) => void;
  onDelete: (transport: AdminTransport) => void;
}

export function getTransportIcon(type: string) {
  switch (type) {
    case "flight":
      return <Plane size={16} className="text-sky-600" />;
    case "train":
      return <Train size={16} className="text-amber-600" />;
    case "boat":
      return <Ship size={16} className="text-cyan-600" />;
    case "bus":
      return <Bus size={16} className="text-indigo-600" />;
    default:
      return <Car size={16} className="text-blue-600" />;
  }
}

export function getTransportTypeName(type: string) {
  switch (type) {
    case "flight":
      return "Máy bay";
    case "train":
      return "Tàu hỏa";
    case "boat":
      return "Tàu thủy / Du thuyền";
    case "bus":
      return "Xe khách";
    default:
      return "Xe ô tô";
  }
}

export function TransportsTableTab({
  transports,
  providers,
  onEdit,
  onDelete,
}: TransportsTableTabProps) {
  const [search, setSearch] = useState("");
  const [transportTypeFilter, setTransportTypeFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredTransports = useMemo(() => {
    return transports.filter((t) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchProv = t.providers?.name.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchProv) return false;
      }
      if (transportTypeFilter && t.transport_type !== transportTypeFilter) return false;
      if (providerFilter && String(t.provider_id) !== providerFilter) return false;
      if (statusFilter !== "" && String(t.status) !== statusFilter) return false;
      return true;
    });
  }, [transports, search, transportTypeFilter, providerFilter, statusFilter]);

  return (
    <>
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          <div className="w-full sm:w-72">
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Tìm theo tên xe, máy bay, đối tác..."
            />
          </div>

          <select
            value={transportTypeFilter}
            onChange={(e) => setTransportTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Tất cả loại hình</option>
            <option value="car">Xe ô tô / Xe khách</option>
            <option value="flight">Máy bay</option>
            <option value="train">Tàu hỏa</option>
            <option value="boat">Tàu thủy / Du thuyền</option>
          </select>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Tất cả đối tác cung cấp</option>
            {providers.map((p) => (
              <option key={p.provider_id} value={p.provider_id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang hoạt động</option>
            <option value="0">Tạm dừng</option>
          </select>
        </div>
      </div>

      {/* Transports Table */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Tên phương tiện</th>
                <th className="px-4 py-4">Loại hình</th>
                <th className="px-4 py-4 text-center">Sức chứa (chỗ)</th>
                <th className="px-4 py-4">Đơn vị cung cấp</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Không tìm thấy phương tiện nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredTransports.map((t) => (
                  <tr key={t.transport_id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                          {getTransportIcon(t.transport_type)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 leading-snug">{t.name}</p>
                          {t.description && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {t.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {getTransportIcon(t.transport_type)}
                        {getTransportTypeName(t.transport_type)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-800">
                      {t.capacity > 0 ? `${t.capacity} chỗ` : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-800">
                        {t.providers?.name || "Chưa gán"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <AdminStatusBadge tone={t.status === 1 ? "success" : "muted"}>
                        {t.status === 1 ? "Hoạt động" : "Tạm dừng"}
                      </AdminStatusBadge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(t)}
                          className="rounded-xl p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(t)}
                          className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          title="Xóa phương tiện"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

