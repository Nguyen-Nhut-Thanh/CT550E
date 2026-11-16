"use client";

import type { AdminIconActionButtonProps, AdminIconActionTone as Tone } from 'shared';

const toneClassMap: Record<Tone, string> = {
  neutral: "text-slate-400 hover:bg-slate-100",
  primary: "text-blue-600 hover:bg-blue-50",
  danger: "text-red-600 hover:bg-red-50",
};

function getClassName(tone: Tone) {
  return `rounded-lg p-2 transition-all ${toneClassMap[tone]}`;
}

/** Hiển thị nút thao tác bằng biểu tượng, như sửa hoặc xóa. */
export function AdminIconActionButton({
  icon,
  title,
  tone = "neutral",
  onClick,
  href,
  target,
  rel,
}: AdminIconActionButtonProps) {
  const className = getClassName(tone);

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={className} title={title}>
        {icon}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className} title={title}>
      {icon}
    </button>
  );
}
