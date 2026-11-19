"use client";

import { useAdminContentReadOnly } from "@/components/common/admin_shared/guards/AdminContentPermission";
import { AdminPagination } from "@/components/common/admin_shared/tables/AdminPagination";
import {
  BadgeCheck,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  Users,
} from "lucide-react";
import type { UsersTableProps as Props } from "shared";

export function UsersTable({
  users,
  loading,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onToggleStatus,
  onPageChange,
}: Props) {
  const readOnly = useAdminContentReadOnly();

  return (
    <div className="rounded-[14px] border border-[#e1edfc] bg-white shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/75 border-b border-[#edf2fb] text-[11px] font-bold uppercase tracking-wider text-[#7187a9]">
              <th className="px-4.5 py-3.5">Người dùng</th>
              <th className="px-4.5 py-3.5">Liên hệ</th>
              <th className="px-4.5 py-3.5">Vai trò</th>
              <th className="px-4.5 py-3.5">Đăng nhập cuối</th>
              <th className="px-4.5 py-3.5 text-center">Trạng thái</th>
              <th className="px-4.5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf2fb] text-xs">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-7 w-7 animate-spin text-[#075bff]" />
                    <p className="text-xs font-medium text-slate-500">Đang tải danh sách người dùng...</p>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400">
                    <Users size={32} strokeWidth={1.5} className="text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">Không tìm thấy người dùng phù hợp</p>
                    <p className="text-[11px] text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isActive = user.accounts?.status === 1;
                return (
                  <tr
                    key={user.user_id}
                    className="group transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-4.5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e1edfc] bg-slate-100 text-slate-400 shadow-2xs">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Users size={18} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 font-bold text-[#07123e] truncate">
                            {user.full_name}
                            {user.is_staff && (
                              <span title="Tài khoản nhân viên">
                                <BadgeCheck size={14} className="text-[#075bff] shrink-0" />
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-[#7187a9]">ID: #{user.user_id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4.5 py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[#334155]">
                          <Mail size={13} className="text-[#7187a9] shrink-0" />
                          <span className="truncate max-w-[200px]">{user.accounts?.email || "Chưa có email"}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-[#64748b]">
                            <Phone size={13} className="text-[#94a3b8] shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4.5 py-3">
                      {user.is_staff ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                          Nhân viên
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                          Khách hàng
                        </span>
                      )}
                    </td>

                    <td className="px-4.5 py-3 text-slate-600">
                      {user.accounts?.last_login_at
                        ? new Date(user.accounts.last_login_at).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Chưa đăng nhập"}
                    </td>

                    <td className="px-4.5 py-3 text-center">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          <ShieldCheck size={12} /> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                          <ShieldAlert size={12} /> Bị khóa
                        </span>
                      )}
                    </td>

                    <td className="px-4.5 py-3 text-right">
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => onToggleStatus(user)}
                        title={isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                          isActive
                            ? "border-rose-200 bg-rose-50/80 text-rose-600 hover:bg-rose-100/90 hover:border-rose-300"
                            : "border-emerald-200 bg-emerald-50/80 text-emerald-600 hover:bg-emerald-100/90 hover:border-emerald-300"
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Lock size={13} />
                            Khóa
                          </>
                        ) : (
                          <>
                            <Unlock size={13} />
                            Mở khóa
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && users.length > 0 && (
        <AdminPagination
          variant="numbered"
          showSinglePage
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          itemLabel="người dùng"
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
