"use client";

import {
  displayBirthday,
  formatBirthdayInput,
  parseBirthday,
} from "@/lib/booking/birthday";
import { useId, useState } from "react";

/** Hiển thị ô nhập ngày sinh và kiểm tra ngày hợp lệ. */
export function BirthdayInput({
  value,
  onChange,
  label,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  id?: string;
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [blurred, setBlurred] = useState(false);
  const invalid =
    !!value &&
    (blurred || value.length === 10) &&
    parseBirthday(value) === null;
  return (
    <div className="min-w-0">
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        maxLength={10}
        aria-label={`${label}, dd/mm/yyyy`}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${inputId}-error` : undefined}
        value={displayBirthday(value)}
        onChange={(event) => onChange(formatBirthdayInput(event.target.value))}
        onBlur={() => setBlurred(true)}
        placeholder="dd/mm/yyyy"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
      />
      {invalid && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-rose-600">
          Nhập ngày sinh hợp lệ theo dd/mm/yyyy, không sau hôm nay.
        </p>
      )}
    </div>
  );
}
