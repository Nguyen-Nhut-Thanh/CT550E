"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/components/common/Toast";
import type { AccountSettingsTabProps } from "shared";

export function AccountSettingsTab({ user }: AccountSettingsTabProps) {
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [birthday, setBirthday] = useState(user?.birthday || "");
  const [gender, setGender] = useState(user?.gender || "male");
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Đã cập nhật thông tin cá nhân!");
    }, 600);
  };

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Cài đặt tài khoản</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Cập nhật thông tin cá nhân và tài khoản đăng nhập
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Họ và tên</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-sky-500"
            placeholder="Nhập họ và tên"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Số điện thoại</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-sky-500"
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Email (Không thể thay đổi)</label>
          <input
            type="email"
            disabled
            value={user?.accounts?.email || ""}
            className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Ngày sinh</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Giới tính</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-sky-500"
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1766c2] px-6 py-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </form>
    </div>
  );
}
