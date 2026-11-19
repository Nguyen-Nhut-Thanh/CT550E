"use client";

import { AdminScenicHeaderBackground } from "@/components/common/admin_shared/layout/AdminScenicHeaderBackground";
import { AdminStatGrid } from "@/components/common/admin_shared/cards/AdminStatGrid";
import { AdminUsersFilters } from "@/components/users/admin_users/AdminUsersFilters";
import { UsersTable } from "@/components/users/admin_users/AdminUsersTable";
import { getAdminUsers, updateAdminUserStatus } from "@/lib/users/admin/api";
import { useToast } from "@/lib/notifications/useToast";
import {
  BriefcaseBusiness,
  LockKeyhole,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { UserItem } from "shared";

export default function AdminUsersPage() {
  const router = useRouter();
  const pageSize = 10;
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { success, error: showError } = useToast();

  const loadUsers = useCallback(
    async (isInitial = false) => {
      if (isInitial) {
        setLoading(true);
      }

      try {
        setUsers(await getAdminUsers());
      } catch {
        showError("Lỗi tải danh sách người dùng");
      } finally {
        if (isInitial) {
          setLoading(false);
        }
      }
    },
    [showError],
  );

  useEffect(() => {
    void loadUsers(true);
  }, [loadUsers]);

  const handleToggleStatus = async (user: UserItem) => {
    const currentStatus = user.accounts?.status;
    const newStatus = currentStatus === 1 ? 0 : 1;
    const oldUsers = [...users];

    setUsers((current) =>
      current.map((item) =>
        item.user_id === user.user_id
          ? { ...item, accounts: { ...item.accounts, status: newStatus } }
          : item,
      ),
    );

    try {
      await updateAdminUserStatus(user.user_id, newStatus);
      success(newStatus === 1 ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
    } catch {
      setUsers(oldUsers);
      showError("Lỗi kết nối");
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const isFiltered =
    Boolean(search.trim()) || roleFilter !== "all" || statusFilter !== "all";

  const filteredUsers = users.filter((user) => {
    // 1. Tìm kiếm theo tên, email, sđt hoặc id
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      const matchName = user.full_name?.toLowerCase().includes(term);
      const matchEmail = (user.accounts?.email || "").toLowerCase().includes(term);
      const matchPhone = (user.phone || "").toLowerCase().includes(term);
      const matchId = String(user.user_id).includes(term);
      if (!matchName && !matchEmail && !matchPhone && !matchId) return false;
    }

    // 2. Lọc theo vai trò
    if (roleFilter === "staff" && !user.is_staff) return false;
    if (roleFilter === "customer" && user.is_staff) return false;

    // 3. Lọc theo trạng thái
    if (statusFilter === "active" && user.accounts?.status !== 1) return false;
    if (statusFilter === "locked" && user.accounts?.status !== 0) return false;

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-3 font-sans text-sm">
      {/* Header */}
      <header className="relative isolate flex flex-col justify-between gap-3 sm:flex-row sm:items-center @container/users-header">
        <AdminScenicHeaderBackground />
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-10 h-10 rounded-xl text-[#075bff] bg-blue-50 shrink-0 shadow-xs">
            <Users size={22} />
          </span>
          <div>
            <h1 className="text-[24px] font-extrabold leading-[1.25] tracking-[-.6px] text-[#07123e]">
              Quản lý người dùng
            </h1>
            <p className="text-xs text-[#7187a9] mt-0.5">
              Quản lý tài khoản khách hàng và nhân viên hệ thống.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => router.push("/admin/workforce?tab=employees&action=create")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#075bff] hover:bg-[#064ddd] px-4 py-2 text-xs font-[650] whitespace-nowrap text-white transition-colors shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <UserPlus size={16} />
            Thêm nhân viên
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <AdminStatGrid
        label="Thống kê người dùng"
        loading={loading}
        items={[
          {
            id: "total",
            title: "Tổng người dùng",
            value: users.length,
            description: "Toàn bộ tài khoản trong hệ thống",
            icon: Users,
            onClick: () => {
              setRoleFilter("all");
              setStatusFilter("all");
            },
          },
          {
            id: "active",
            title: "Đang hoạt động",
            value: users.filter((u) => u.accounts?.status === 1).length,
            description: "Tài khoản có quyền đăng nhập",
            icon: UserCheck,
            tone: "green",
            onClick: () => setStatusFilter("active"),
          },
          {
            id: "locked",
            title: "Tài khoản bị khóa",
            value: users.filter((u) => u.accounts?.status === 0).length,
            description: "Tài khoản tạm ngưng truy cập",
            icon: LockKeyhole,
            tone: "rose",
            onClick: () => setStatusFilter("locked"),
          },
          {
            id: "staff",
            title: "Tài khoản nhân viên",
            value: users.filter((u) => u.is_staff).length,
            description: "Nhân sự nội bộ và điều hành",
            icon: BriefcaseBusiness,
            tone: "purple",
            onClick: () => setRoleFilter("staff"),
          },
        ]}
      />

      {/* Filter Bar */}
      <AdminUsersFilters
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onReset={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* Users Table */}
      <UsersTable
        users={paginatedUsers}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredUsers.length}
        pageSize={pageSize}
        onToggleStatus={handleToggleStatus}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
