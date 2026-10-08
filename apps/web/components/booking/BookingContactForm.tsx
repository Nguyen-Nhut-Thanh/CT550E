interface BookingContactFormProps {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  note: string;
  onContactNameChange: (value: string) => void;
  onContactPhoneChange: (value: string) => void;
  onContactEmailChange: (value: string) => void;
  onNoteChange: (value: string) => void;
}

export function BookingContactForm({
  contactName,
  contactPhone,
  contactEmail,
  note,
  onContactNameChange,
  onContactPhoneChange,
  onContactEmailChange,
  onNoteChange,
}: BookingContactFormProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          Thông tin liên hệ
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Người nhận xác nhận booking và cập nhật thanh toán.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={contactName}
          onChange={(event) => onContactNameChange(event.target.value)}
          placeholder="Họ và tên liên hệ"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
        />
        <input
          value={contactPhone}
          onChange={(event) => onContactPhoneChange(event.target.value)}
          placeholder="Số điện thoại"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
        />
        <input
          value={contactEmail}
          onChange={(event) => onContactEmailChange(event.target.value)}
          placeholder="Email nhận xác nhận"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white md:col-span-2"
        />
        <textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Ghi chú thêm cho điều hành tour"
          className="min-h-[110px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white md:col-span-2"
        />
      </div>
    </div>
  );
}
