"use client";

export interface BookingCancelReasonPickerProps {
  reasons: string[];
  selectedReason: string;
  onSelectReason: (reason: string) => void;
  customReason: string;
  onCustomReasonChange: (val: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export function BookingCancelReasonPicker({
  reasons,
  selectedReason,
  onSelectReason,
  customReason,
  onCustomReasonChange,
  label = "Lý do hủy tour",
  required = true,
  placeholder = "Vui lòng chia sẻ thêm lý do bạn muốn hủy tour...",
}: BookingCancelReasonPickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {reasons.map((reason) => {
          const isSelected = selectedReason === reason;
          return (
            <button
              key={reason}
              type="button"
              onClick={() => onSelectReason(reason)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition cursor-pointer ${
                isSelected
                  ? "bg-blue-50 border-blue-500 font-bold text-blue-900 shadow-2xs"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span
                className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300"
                }`}
              >
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span className="truncate">{reason}</span>
            </button>
          );
        })}
      </div>

      {selectedReason === "Lý do khác" && (
        <textarea
          value={customReason}
          onChange={(e) => onCustomReasonChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          required={required}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition shadow-2xs"
        />
      )}
    </div>
  );
}

