"use client";

import { BirthdayInput } from "@/components/common/BirthdayInput";
import CustomDropdown from "@/components/common/CustomDropdown";
import { useToast } from "@/components/common/Toast";
import { updateUserProfile, uploadUserAvatar } from "@/lib/client/api/authApi";
import { displayBirthday, parseBirthday } from "@/lib/client/utils/bookingBirthday";
import {
  CalendarDays,
  Camera,
  ContactRound,
  Home,
  Info,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Plane,
  Save,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { AccountUserProps as AccountSettingsTabProps, UserProfile } from "shared";
import { AccountAvatarEditor } from "./AccountAvatarEditor";
import { AccountPasswordForm } from "./AccountPasswordForm";

export function AccountSettingsTab({ user, onProfileSaved }: AccountSettingsTabProps & { onProfileSaved?: (updates: Partial<UserProfile>) => void }) {
  const [tab, setTab] = useState<"profile" | "password">("profile");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [file, setFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [birthday, setBirthday] = useState(displayBirthday(user?.birthday?.slice(0, 10) || ""));
  const [gender, setGender] = useState(user?.gender || "");
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.error("Vui lòng nhập họ và tên."); return; }
    const parsedBirthday = parseBirthday(birthday);
    if (parsedBirthday === null) { toast.error("Ngày sinh không hợp lệ. Vui lòng nhập dd/mm/yyyy."); return; }
    let nextAvatar = avatarUrl.trim();
    if (!file && nextAvatar && nextAvatar !== user?.avatar_url) {
      try {
        const url = new URL(nextAvatar);
        if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error();
      } catch { toast.error("Vui lòng nhập link ảnh http:// hoặc https:// hợp lệ."); return; }
    }
    setSaving(true);
    try {
      if (file) {
        nextAvatar = (await uploadUserAvatar(file)).url;
        setAvatarUrl(nextAvatar);
        setFile(null);
      }
      const updates = { full_name: fullName.trim(), phone: phone.trim(), address: address.trim(), gender, avatar_url: nextAvatar, birthday: parsedBirthday || null };
      await updateUserProfile(updates);
      setAvatarUrl(nextAvatar);
      onProfileSaved?.(updates);
      toast.success("Đã cập nhật thông tin cá nhân!");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể lưu thông tin."); }
    finally { setSaving(false); }
  };

  return (
    <div className="w-full">
      <div className="relative overflow-hidden pb-7 pt-2 sm:pb-9">
        <div className="mb-7 flex items-center gap-3 text-[13px] text-slate-400"><Link href="/" aria-label="Trang chủ"><Home size={17} /></Link><span>/</span><span>Cài đặt</span></div>
        <div aria-hidden="true" className="pointer-events-none absolute -right-2 bottom-0 hidden h-32 w-72 items-center justify-center gap-5 text-blue-300/80 xl:flex">
          <Camera size={62} strokeWidth={1.2} className="-rotate-12 rounded-2xl bg-white/60 p-2 shadow-sm" />
          <Plane size={44} className="-translate-y-7 -rotate-12 text-blue-400" />
          <div className="rotate-12 rounded-lg border-[6px] border-white bg-gradient-to-b from-sky-200 to-emerald-200 p-5 shadow-md"><MapPin size={38} className="text-white" /></div>
        </div>
        <h1 className="relative text-[26px] font-extrabold tracking-tight text-[#13274c] sm:text-[32px]">Cài đặt tài khoản</h1>
        <p className="mt-1 text-[15px] font-medium text-slate-500">
          Cập nhật thông tin cá nhân và tài khoản để trải nghiệm tốt hơn
        </p>
      </div>

      <div className="rounded-[24px] border border-white/90 bg-white/95 px-4 pb-6 shadow-[0_8px_40px_-20px_rgba(63,110,173,0.18)] sm:px-6 sm:pb-8">
      <div className="mb-6 flex border-b border-slate-100" aria-label="Mục cài đặt">
        {([{ id: "profile", label: "Thông tin cá nhân", icon: UserRound }, { id: "password", label: "Thay đổi mật khẩu", icon: LockKeyhole }] as const).map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" aria-pressed={tab === id} disabled={saving} onClick={() => setTab(id)} className={`relative flex flex-1 items-center justify-center gap-2 border-b-2 px-2 py-5 text-[13px] font-bold transition sm:text-[15px] ${tab === id ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-blue-600"}`}><Icon size={19} aria-hidden="true" />{label}</button>
        ))}
      </div>
      <div hidden={tab !== "profile"}>
      <div className="mb-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600"><ContactRound size={21} /></span><div><h2 className="text-[17px] font-bold text-[#13274c]">Thông tin cá nhân</h2><p className="mt-1 text-[13px] text-slate-500">Cập nhật thông tin cá nhân của bạn</p></div></div>
      <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <form onSubmit={handleSave} className="min-w-0">
        <fieldset disabled={saving} className="space-y-4 disabled:opacity-60 [&_input]:text-[15px] [&_input]:font-medium [&_input]:text-[#233b60]">
        <AccountAvatarEditor url={avatarUrl} onUrlChange={setAvatarUrl} file={file} onFileChange={setFile} />
        <div className="space-y-1.5">
          <label htmlFor="profile-fullname" className="text-[13px] font-semibold text-slate-700">Họ và tên</label>
          <div className="relative"><UserRound size={17} className="pointer-events-none absolute left-3.5 top-3 text-slate-500" />
          <input
            id="profile-fullname"
            type="text"
            required
            maxLength={150}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:border-sky-500"
            placeholder="Nhập họ và tên"
          />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="profile-phone" className="text-[13px] font-semibold text-slate-700">Số điện thoại</label>
          <div className="relative"><Phone size={17} className="pointer-events-none absolute left-3.5 top-3 text-slate-500" />
          <input
            id="profile-phone"
            type="tel"
            maxLength={15}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:border-sky-500"
            placeholder="Nhập số điện thoại"
          />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="profile-email" className="text-[13px] font-semibold text-slate-700">Email (Không thể thay đổi)</label>
          <div className="relative"><Mail size={17} className="pointer-events-none absolute left-3.5 top-3 text-slate-500" />
          <input
            id="profile-email"
            type="email"
            disabled
            value={user?.accounts?.email || ""}
            className="w-full rounded-xl border border-slate-100 bg-[#f3f6fb] py-2.5 pl-10 pr-4 text-slate-500"
          />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="profile-birthday" className="text-[13px] font-semibold text-slate-700">Ngày sinh</label>
            <BirthdayInput id="profile-birthday" value={birthday} onChange={setBirthday} label="Ngày sinh" />
          </div>

          <div className="space-y-1.5">
            <p className="text-[13px] font-semibold text-slate-700">Giới tính</p>
            <CustomDropdown icon={UserRound} variant="compact" className="[&_button]:min-w-0 [&_button]:py-3" placeholder="Giới tính" selectedValue={gender} onSelect={setGender} options={[
              { value: "", label: "Chưa cung cấp" }, { value: "male", label: "Nam" },
              { value: "female", label: "Nữ" }, { value: "other", label: "Khác" },
            ]} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="profile-address" className="text-[13px] font-semibold text-slate-700">Địa chỉ</label>
          <div className="relative"><MapPin size={17} className="pointer-events-none absolute left-3.5 top-3 text-slate-500" /><input id="profile-address" type="text" autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Nhập địa chỉ" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:border-sky-500" /></div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1674ed] px-6 py-3 text-[15px] font-bold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Lưu thay đổi</span>
          </button>
        </div>
        </fieldset>
      </form>
      <aside className="space-y-3 xl:pt-1">
        <section className="rounded-2xl border border-[#edf2fa] bg-[#f8faff] p-4 sm:p-5">
          <div className="mb-5 flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><ContactRound size={21} /></span><div><h2 className="text-[15px] font-bold text-[#13274c]">Thông tin tài khoản</h2><p className="mt-1 text-[13px] text-slate-500">Một số thông tin cơ bản về tài khoản của bạn</p></div></div>
          <dl className="space-y-1.5">
            {[
              { label: "Họ và tên", value: user?.full_name, icon: UserRound },
              { label: "Email", value: user?.accounts?.email, icon: Mail },
              { label: "Số điện thoại", value: user?.phone, icon: Phone },
              { label: "Ngày sinh", value: user?.birthday ? displayBirthday(user.birthday.slice(0, 10)) : null, icon: CalendarDays },
              { label: "Giới tính", value: user?.gender === "male" ? "Nam" : user?.gender === "female" ? "Nữ" : user?.gender === "other" ? "Khác" : null, icon: UserRound },
              { label: "Địa chỉ", value: user?.address, icon: MapPin },
            ].map(({ label, value, icon: Icon }) => <div key={label} className="grid grid-cols-[18px_90px_minmax(0,1fr)] items-start gap-2 rounded-xl bg-[#f0f4fa] px-3 py-3.5 text-[13px] sm:gap-3"><Icon size={16} className="text-[#617695]" /><dt className="font-medium text-[#304766]">{label}</dt><dd className="break-words text-[#74849d]">{value || "Chưa cập nhật"}</dd></div>)}
          </dl>
        </section>
        <section className="flex gap-3 rounded-2xl border border-blue-50 bg-[#edf5ff] p-5 text-blue-600"><Info size={22} className="mt-0.5 shrink-0" /><div><h3 className="text-[15px] font-bold">Lưu ý</h3><p className="mt-1.5 text-[13px] leading-6 text-[#5a7eae]">Hãy cập nhật đầy đủ thông tin để nhận được hỗ trợ tốt hơn và trải nghiệm các dịch vụ của JourniTrip.</p></div></section>
      </aside>
      </div>
      </div>
      <div hidden={tab !== "password"}><AccountPasswordForm hasPassword={user?.accounts?.hasPassword !== false} onSaved={() => onProfileSaved?.({ accounts: { ...user?.accounts, hasPassword: true } })} /></div>
      </div>
    </div>
  );
}
