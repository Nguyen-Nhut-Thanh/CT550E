import { UserRound } from "lucide-react";
interface BookingContactFormProps {
  contactName: string; contactPhone: string; contactEmail: string; note: string;
  onContactNameChange: (value: string) => void; onContactPhoneChange: (value: string) => void;
  onContactEmailChange: (value: string) => void; onNoteChange: (value: string) => void;
}
export function BookingContactForm({ contactName, contactPhone, contactEmail, note, onContactNameChange, onContactPhoneChange, onContactEmailChange, onNoteChange }: BookingContactFormProps) {
  const inputClass = "mt-2 block w-full rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50";
  return (
    <section className="rounded-2xl border border-blue-100/60 bg-white p-5 shadow-[0_4px_24px_rgba(37,99,235,0.04)] sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><UserRound className="h-5 w-5 text-blue-700" />2. Thông tin liên hệ</h2>
      <p className="mt-1 text-sm text-slate-500">Vui lòng cung cấp thông tin chính xác để chúng tôi hỗ trợ bạn tốt nhất.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-600">Họ và tên <span className="text-rose-500">*</span><input autoComplete="name" value={contactName} onChange={event => onContactNameChange(event.target.value)} placeholder="Họ và tên liên hệ" className={inputClass} /></label>
        <label className="rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-600">Số điện thoại <span className="text-rose-500">*</span><input type="tel" autoComplete="tel" value={contactPhone} onChange={event => onContactPhoneChange(event.target.value)} placeholder="Số điện thoại" className={inputClass} /></label>
        <label className="rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-600 sm:col-span-2">Email <span className="text-rose-500">*</span><input type="email" autoComplete="email" value={contactEmail} onChange={event => onContactEmailChange(event.target.value)} placeholder="Email nhận xác nhận" className={inputClass} /></label>
        <label className="rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-600 sm:col-span-2">Ghi chú (yêu cầu đặc biệt, dị ứng, ...)<textarea value={note} onChange={event => onNoteChange(event.target.value)} placeholder="Ví dụ: yêu cầu phòng gần nhau, ăn chay, ..." className={`${inputClass} min-h-[110px] resize-y`} /></label>
      </div>
    </section>
  );
}
