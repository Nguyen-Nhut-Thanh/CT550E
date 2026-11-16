"use client";

import { useMemo, useState } from "react";
import { AdminSearchInput } from "@/components/common/admin_shared/tables/AdminSearchInput";
import { AdminStatusBadge } from "@/components/common/admin_shared/controls/AdminStatusBadge";
import { Building2, Edit2, Trash2 } from "lucide-react";
import type { AdminProvider } from "shared";

export interface ProvidersTableTabProps {
  providers: AdminProvider[];
  onEdit: (provider: AdminProvider) => void;
  onDelete: (provider: AdminProvider) => void;
}

export function ProvidersTableTab({
  providers,
  onEdit,
  onDelete,
}: ProvidersTableTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchContact = p.contact_info?.toLowerCase().includes(q);
        if (!matchName && !matchContact) return false;
      }
      if (statusFilter !== "" && String(p.status) !== statusFilter) return false;
      return true;
    });
  }, [providers, search, statusFilter]);

  return (
    <>
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          <div className="w-full sm:w-72">
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Tìm theo tên đối tác, hotline..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang hợp tác</option>
            <option value="0">Tạm dừng</option>
          </select>
        </div>
      </div>

      {/* Providers Table */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Tên đối tác / Nhà cung cấp</th>
                <th className="px-4 py-4">Lĩnh vực</th>
                <th className="px-4 py-4">Thông tin liên hệ</th>
                <th className="px-4 py-4 text-center">Phương tiện liên kết</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProviders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Không tìm thấy đối tác nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredProviders.map((p) => (
                  <tr key={p.provider_id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                          <Building2 size={22} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{p.name}</p>
                          <p className="text-[11px] text-slate-400">Mã: #{p.provider_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 capitalize">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-slate-700 whitespace-pre-line max-w-xs">
                      {p.contact_info || "—"}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-800">
                      {p._count?.transports ?? 0} xe/tàu
                    </td>
                    <td className="px-4 py-4">
                      <AdminStatusBadge tone={p.status === 1 ? "success" : "muted"}>
                        {p.status === 1 ? "Đang hợp tác" : "Tạm dừng"}
                      </AdminStatusBadge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(p)}
                          className="rounded-xl p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(p)}
                          className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          title="Xóa đối tác"
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

