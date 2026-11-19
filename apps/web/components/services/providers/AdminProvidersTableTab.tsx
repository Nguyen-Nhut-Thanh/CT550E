"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSearchInput } from "@/components/common/admin_shared/tables/AdminSearchInput";
import { AdminPagination } from "@/components/common/admin_shared/tables/AdminPagination";
import { AdminStatusBadge } from "@/components/common/admin_shared/controls/AdminStatusBadge";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { Building2, CheckCircle2, Edit2, Trash2 } from "lucide-react";
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
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

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

  const totalPages = Math.max(1, Math.ceil(filteredProviders.length / pageSize));
  const current = Math.min(page, totalPages);
  const visibleProviders = filteredProviders.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      <div className="rounded-[14px] border border-[#e1edfc] bg-white p-3.5 shadow-2xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(260px,2fr)_minmax(180px,1fr)] [&_input]:rounded-lg [&_input]:border-[#e1edfc] [&_input]:text-xs [&_button[aria-haspopup=listbox]]:rounded-lg [&_button[aria-haspopup=listbox]]:border-[#e1edfc] [&_button[aria-haspopup=listbox]]:bg-white [&_button[aria-haspopup=listbox]]:text-xs [&_button[aria-haspopup=listbox]]:min-h-[38px]">
          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo tên đối tác, hotline..."
          />

          <CustomDropdown
            variant="compact"
            matchTriggerWidth
            icon={CheckCircle2}
            placeholder="Tất cả trạng thái"
            selectedValue={statusFilter}
            onSelect={setStatusFilter}
            options={[
              { value: "", label: "Tất cả trạng thái" },
              { value: "1", label: "Đang hợp tác" },
              { value: "0", label: "Tạm dừng" },
            ]}
          />
        </div>
      </div>

      {/* Providers Table */}
      <div className="rounded-[14px] border border-[#e1edfc] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left whitespace-nowrap text-xs">
            <thead className="bg-slate-50/75 border-b border-[#edf2fb] text-[11px] font-bold uppercase tracking-wider text-[#7187a9]">
              <tr>
                <th className="px-4.5 py-3">Tên đối tác / Nhà cung cấp</th>
                <th className="px-4.5 py-3">Lĩnh vực</th>
                <th className="px-4.5 py-3">Thông tin liên hệ</th>
                <th className="px-4.5 py-3 text-center">Phương tiện liên kết</th>
                <th className="px-4.5 py-3">Trạng thái</th>
                <th className="px-4.5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2fb]">
              {filteredProviders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#7187a9]">
                    Không tìm thấy đối tác nào phù hợp.
                  </td>
                </tr>
              ) : (
                visibleProviders.map((p) => (
                  <tr key={p.provider_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4.5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#075bff] shadow-xs">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-[13px] text-[#07123e] leading-snug">{p.name}</p>
                          <p className="text-[11px] text-[#8fa2be]">Mã: #{p.provider_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4.5 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 capitalize">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4.5 py-3 text-xs font-medium text-[#192e52] whitespace-pre-line max-w-xs">
                      {p.contact_info || "—"}
                    </td>
                    <td className="px-4.5 py-3 text-center font-bold text-[#192e52]">
                      {p._count?.transports ?? 0} xe/tàu
                    </td>
                    <td className="px-4.5 py-3">
                      <AdminStatusBadge tone={p.status === 1 ? "success" : "muted"}>
                        {p.status === 1 ? "Đang hợp tác" : "Tạm dừng"}
                      </AdminStatusBadge>
                    </td>
                    <td className="px-4.5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(p)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-[#075bff] transition cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(p)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          title="Xóa đối tác"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredProviders.length > 0 && (
          <AdminPagination
            variant="numbered"
            showSinglePage
            currentPage={current}
            totalPages={totalPages}
            totalItems={filteredProviders.length}
            pageSize={pageSize}
            itemLabel="đối tác"
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

