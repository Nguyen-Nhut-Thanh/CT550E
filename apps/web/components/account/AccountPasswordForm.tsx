"use client";

import { changeUserPassword } from "@/lib/account/api";
import { useToast } from "@/lib/notifications/useToast";
import { Loader2, LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";

export function AccountPasswordForm({ hasPassword, onSaved }: { hasPassword: boolean; onSaved: () => void }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (newPassword.length < 8) { toast.error("Mật khẩu mới cần ít nhất 8 ký tự."); return; }
    if (newPassword !== confirmPassword) { toast.error("Xác nhận mật khẩu không khớp."); return; }
    if (hasPassword && newPassword === oldPassword) { toast.error("Mật khẩu mới phải khác mật khẩu hiện tại."); return; }
    setSaving(true);
    try {
      await changeUserPassword({ ...(hasPassword ? { oldPassword } : {}), newPassword });
      setOldPassword(""); setNewPassword(""); setConfirmPassword(""); onSaved();
      toast.success(hasPassword ? "Đã thay đổi mật khẩu!" : "Đã thiết lập mật khẩu!");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể đổi mật khẩu."); }
    finally { setSaving(false); }
  }
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-[19px] font-bold text-slate-900">{hasPassword ? "Thay đổi mật khẩu" : "Thiết lập mật khẩu"}</h2>
      <p className="mb-5 mt-1 text-[15px] text-slate-500">{hasPassword ? "Chọn mật khẩu có ít nhất 8 ký tự." : "Bạn đang đăng nhập bằng Google. Thiết lập mật khẩu để có thể đăng nhập bằng email."}</p>
      <fieldset disabled={saving} className="space-y-5 disabled:opacity-60">
        {[
          ...(hasPassword ? [{ id: "current-password", label: "Mật khẩu hiện tại", value: oldPassword, setter: setOldPassword, autoComplete: "current-password", minLength: 1 }] : []),
          { id: "new-password", label: "Mật khẩu mới", value: newPassword, setter: setNewPassword, autoComplete: "new-password", minLength: 8 },
          { id: "confirm-password", label: "Xác nhận mật khẩu mới", value: confirmPassword, setter: setConfirmPassword, autoComplete: "new-password", minLength: 8 },
        ].map((field) => <div key={field.id} className="space-y-1.5"><label htmlFor={field.id} className="text-[13px] font-bold text-slate-700">{field.label}</label><input id={field.id} type="password" required minLength={field.minLength} maxLength={128} autoComplete={field.autoComplete} value={field.value} onChange={(event) => field.setter(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-[15px] outline-none focus:border-sky-500" /></div>)}
        <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#1766c2] px-6 py-3 text-[15px] font-bold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? <Loader2 size={16} className="animate-spin" /> : <LockKeyhole size={16} />}{saving ? "Đang lưu..." : hasPassword ? "Đổi mật khẩu" : "Thiết lập mật khẩu"}</button>
      </fieldset>
    </form>
  );
}
