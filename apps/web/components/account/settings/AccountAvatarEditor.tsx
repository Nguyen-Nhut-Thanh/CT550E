"use client";

import { useToast } from "@/components/common/Toast";
import { Camera, Link2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AccountAvatar } from "../AccountAvatar";

export function AccountAvatarEditor({ url, onUrlChange, file, onFileChange }: {
  url: string; onUrlChange: (url: string) => void; file: File | null; onFileChange: (file: File | null) => void;
}) {
  const [mode, setMode] = useState<"upload" | "link">("upload");
  const [preview, setPreview] = useState("");
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const src = URL.createObjectURL(file);
    setPreview(src);
    return () => URL.revokeObjectURL(src);
  }, [file]);
  return (
    <section className="space-y-3 pb-1">
      <h2 className="text-[13px] font-bold text-[#13274c]">Ảnh đại diện</h2>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative ml-2 h-24 w-24 shrink-0">
        <div className="relative h-full w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Ảnh đại diện đã chọn" className="h-full w-full object-cover" />
          ) : <AccountAvatar source={url} name="bạn" sizes="96px" />}
        </div>
        <button type="button" aria-label="Tải ảnh đại diện" onClick={() => { setMode("upload"); fileInput.current?.click(); }} className="absolute -bottom-0.5 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 shadow-sm transition hover:bg-blue-50"><Camera size={18} /></button>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            {([['upload', 'Tải ảnh lên', Upload], ['link', 'Dán link ảnh', Link2]] as const).map(([id, label, Icon]) => <button key={id} type="button" aria-pressed={mode === id} onClick={() => { setMode(id); if (id === "upload") fileInput.current?.click(); else onFileChange(null); }} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-[13px] font-semibold transition ${mode === id ? 'border-blue-100 bg-blue-50 text-blue-600' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'}`}><Icon size={14} />{label}</button>)}
          </div>
          <div hidden={mode !== "upload"}>
            <label htmlFor="avatar-file" className="sr-only">Chọn ảnh đại diện</label>
            <input ref={fileInput} id="avatar-file" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => {
              const selected = event.target.files?.[0];
              event.target.value = "";
              if (!selected) return;
              if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type) || selected.size > 5 * 1024 * 1024 || !selected.size) {
                toast.error("Chọn ảnh JPG, PNG hoặc WebP, tối đa 5 MB."); return;
              }
              onFileChange(selected);
            }} />
            <p className="break-all text-[13px] text-slate-500">{file?.name || "JPG, PNG hoặc WebP. Tối đa 5 MB."}</p>
          </div>
          {mode === "link" && <>
            <label htmlFor="avatar-url" className="sr-only">Link ảnh đại diện</label>
            <input id="avatar-url" type="url" value={url} onChange={(event) => onUrlChange(event.target.value)} placeholder="https://example.com/avatar.jpg" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[15px] outline-none focus:border-sky-500" />
            <p className="text-[13px] text-slate-500">Dán đường dẫn trực tiếp đến ảnh công khai.</p>
          </>}
          {(url || file) && <button type="button" onClick={() => { onUrlChange(""); onFileChange(null); }} className="text-[13px] font-medium text-slate-400 hover:text-blue-600">Dùng ảnh mặc định</button>}
        </div>
      </div>
    </section>
  );
}
