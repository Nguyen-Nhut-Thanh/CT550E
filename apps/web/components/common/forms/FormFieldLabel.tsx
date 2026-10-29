"use client";

import type { FormFieldLabelProps } from 'shared';

/** Hiển thị nhãn của trường nhập liệu, có thể kèm biểu tượng. */
export default function FormFieldLabel({
  children,
  icon,
  className = "",
}: FormFieldLabelProps) {
  return (
    <label
      className={`text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 ${className}`.trim()}
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        {children}
      </span>
    </label>
  );
}
