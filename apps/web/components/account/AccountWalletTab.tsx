"use client";

import { CreditCard, Wallet } from "lucide-react";

export function AccountWalletTab() {
  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Ví & Thanh toán</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Quản lý phương thức thanh toán và ưu đãi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-[#1766c2]">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Số dư ví JourniTrip</h3>
              <p className="text-xs text-slate-500">Sử dụng thanh toán các dịch vụ du lịch</p>
            </div>
          </div>
          <p className="text-3xl font-black text-[#1766c2]">0đ</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Phương thức lưu trữ</h3>
              <p className="text-xs text-slate-500">Thẻ và ví liên kết</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">Chưa có thẻ nào được lưu trữ</p>
        </div>
      </div>
    </div>
  );
}
