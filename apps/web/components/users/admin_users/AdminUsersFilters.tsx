"use client";

import { Filter, RotateCcw, ShieldCheck, UserCheck, Users } from "lucide-react";
import { AdminSearchInput } from "@/components/common/admin_shared/tables/AdminSearchInput";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";

interface AdminUsersFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onReset: () => void;
  isFiltered: boolean;
}

export function AdminUsersFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onReset,
  isFiltered,
}: AdminUsersFiltersProps) {
  return (
    <section
      aria-label="Bộ lọc người dùng"
      className="rounded-[14px] border border-[#e1edfc] bg-white p-3.5 shadow-2xs"
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between [&_input]:rounded-lg [&_input]:border-[#e1edfc] [&_input]:text-xs [&_button[aria-haspopup=listbox]]:rounded-lg [&_button[aria-haspopup=listbox]]:border-[#e1edfc] [&_button[aria-haspopup=listbox]]:bg-white [&_button[aria-haspopup=listbox]]:text-xs [&_button[aria-haspopup=listbox]]:min-h-[38px]">
        <div className="grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(240px,2fr)_minmax(170px,1fr)_minmax(170px,1fr)]">
          <AdminSearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Tìm theo tên, email, số điện thoại..."
            roundedClassName="rounded-lg"
          />

          <CustomDropdown
            variant="compact"
            matchTriggerWidth
            icon={Users}
            selectedValue={roleFilter}
            onSelect={onRoleFilterChange}
            options={[
              { value: "all", label: "Tất cả vai trò" },
              { value: "customer", label: "Khách hàng" },
              { value: "staff", label: "Nhân viên" },
            ]}
          />

          <CustomDropdown
            variant="compact"
            matchTriggerWidth
            icon={ShieldCheck}
            selectedValue={statusFilter}
            onSelect={onStatusFilterChange}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "active", label: "Đang hoạt động" },
              { value: "locked", label: "Đã bị khóa" },
            ]}
          />
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <RotateCcw size={14} />
            Đặt lại
          </button>
        )}
      </div>
    </section>
  );
}

