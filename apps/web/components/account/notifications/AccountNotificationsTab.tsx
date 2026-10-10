"use client";

import { Bell } from "lucide-react";

export function AccountNotificationsTab() {
  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Thông báo</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Cập nhật trạng thái đơn đặt tour và ưu đãi mới nhất
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
        <Bell className="mx-auto mb-3 h-10 w-10 text-sky-400" />
        <p className="text-sm font-bold text-slate-700">Hiện tại bạn chưa có thông báo mới</p>
        <p className="mt-1 text-xs text-slate-500">Các cập nhật quan trọng về chuyến đi sẽ xuất hiện tại đây.</p>
      </div>
    </div>
  );
}
