"use client";
import { useState } from "react";

export function PostTagsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  function add() {
    const tags = draft
      .split(/[,\n]/)
      .map((tag) => tag.trim().replace(/^#+/, ""))
      .filter(Boolean);
    onChange([...new Set([...value, ...tags])].slice(0, 20));
    setDraft("");
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
          >
            #{tag}
            <button
              type="button"
              aria-label={`Xóa thẻ ${tag}`}
              onClick={() => onChange(value.filter((item) => item !== tag))}
              className="px-1 text-slate-400 hover:text-red-600"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        aria-label="Thẻ bài viết"
        maxLength={1000}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={add}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            add();
          }
        }}
        placeholder="Nhập thẻ rồi nhấn Enter"
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
      />
      <p className="text-[11px] text-slate-400">
        Tối đa 20 thẻ. Có thể nhập nhiều thẻ, cách nhau bằng dấu phẩy.
      </p>
    </div>
  );
}
