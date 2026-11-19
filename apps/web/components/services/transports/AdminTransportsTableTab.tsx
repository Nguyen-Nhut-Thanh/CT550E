"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSearchInput } from "@/components/common/admin_shared/tables/AdminSearchInput";
import { AdminPagination } from "@/components/common/admin_shared/tables/AdminPagination";
import { AdminStatusBadge } from "@/components/common/admin_shared/controls/AdminStatusBadge";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { Building2, Bus, Car, CheckCircle2, Edit2, Plane, Ship, Train, Trash2 } from "lucide-react";
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
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setPage(1);
  }, [search, transportTypeFilter, providerFilter, statusFilter]);

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

  const totalPages = Math.max(1, Math.ceil(filteredTransports.length / pageSize));
  const current = Math.min(page, totalPages);
  const visibleTransports = filteredTransports.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      <div className="rounded-[14px] border border-[#e1edfc] bg-white p-3.5 shadow-2xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(260px,2fr)_repeat(3,minmax(160px,1fr))] [&_input]:rounded-lg [&_input]:border-[#e1edfc] [&_input]:text-xs [&_button[aria-haspopup=listbox]]:rounded-lg [&_button[aria-haspopup=listbox]]:border-[#e1edfc] [&_button[aria-haspopup=listbox]]:bg-white [&_button[aria-haspopup=listbox]]:text-xs [&_button[aria-haspopup=listbox]]:min-h-[38px]">
          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo tên xe, máy bay, đối tác..."
          />

          <CustomDropdown
            variant="compact"
            matchTriggerWidth
            icon={Car}
            placeholder="Tất cả loại hình"
            selectedValue={transportTypeFilter}
            onSelect={setTransportTypeFilter}
            options={[
              { value: "", label: "Tất cả loại hình" },
              { value: "car", label: "Xe ô tô / Xe khách" },
              { value: "flight", label: "Máy bay" },
              { value: "train", label: "Tàu hỏa" },
              { value: "boat", label: "Tàu thủy / Du thuyền" },
            ]}
          />

          <CustomDropdown
            variant="compact"
            matchTriggerWidth
            icon={Building2}
            placeholder="Tất cả đối tác"
            selectedValue={providerFilter}
            onSelect={setProviderFilter}
            options={[
              { value: "", label: "Tất cả đối tác cung cấp" },
              ...providers.map((p) => ({
                value: String(p.provider_id),
                label: p.name,
              })),
            ]}
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
              { value: "1", label: "Đang hoạt động" },
              { value: "0", label: "Tạm dừng" },
            ]}
          />
        </div>
      </div>

      {/* Transports Table */}
      <div className="rounded-[14px] border border-[#e1edfc] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left whitespace-nowrap text-xs">
            <thead className="bg-slate-50/75 border-b border-[#edf2fb] text-[11px] font-bold uppercase tracking-wider text-[#7187a9]">
              <tr>
                <th className="px-4.5 py-3">Tên phương tiện</th>
                <th className="px-4.5 py-3">Loại hình</th>
                <th className="px-4.5 py-3 text-center">Sức chứa (chỗ)</th>
                <th className="px-4.5 py-3">Đơn vị cung cấp</th>
                <th className="px-4.5 py-3">Trạng thái</th>
                <th className="px-4.5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2fb]">
              {filteredTransports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#7187a9]">
                    Không tìm thấy phương tiện nào phù hợp.
                  </td>
                </tr>
              ) : (
                visibleTransports.map((t) => (
                  <tr key={t.transport_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4.5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#075bff] shadow-xs">
                          {getTransportIcon(t.transport_type)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[13px] text-[#07123e] leading-snug">{t.name}</p>
                          {t.description && (
                            <p className="text-[11px] text-[#7187a9] line-clamp-1 mt-0.5">
                              {t.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4.5 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                        {getTransportIcon(t.transport_type)}
                        {getTransportTypeName(t.transport_type)}
                      </span>
                    </td>
                    <td className="px-4.5 py-3 text-center font-bold text-[#192e52]">
                      {t.capacity > 0 ? `${t.capacity} chỗ` : "—"}
                    </td>
                    <td className="px-4.5 py-3">
                      <span className="font-semibold text-[#192e52]">
                        {t.providers?.name || "Chưa gán"}
                      </span>
                    </td>
                    <td className="px-4.5 py-3">
                      <AdminStatusBadge tone={t.status === 1 ? "success" : "muted"}>
                        {t.status === 1 ? "Hoạt động" : "Tạm dừng"}
                      </AdminStatusBadge>
                    </td>
                    <td className="px-4.5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(t)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-[#075bff] transition cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(t)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          title="Xóa phương tiện"
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
        {filteredTransports.length > 0 && (
          <AdminPagination
            variant="numbered"
            showSinglePage
            currentPage={current}
            totalPages={totalPages}
            totalItems={filteredTransports.length}
            pageSize={pageSize}
            itemLabel="phương tiện"
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

