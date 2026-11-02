"use client";

import { getToken } from "@/lib/auth/session";
import { API_BASE } from "@/lib/http/config";
import { uploadAuthenticatedFile } from "@/lib/http/uploadApi";
import { Loader2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import type { ImageUploadProps } from 'shared';
import { ImagePreviewCarousel } from './ImagePreviewCarousel';

/** Hiển thị vùng tải ảnh, kéo thả ảnh và xem trước các ảnh đã chọn. */
export const ImageUpload = ({
  value,
  onChange,
  multiple = false,
  endpoint = "/auth/upload-avatar",
  label = "Kéo thả ảnh vào đây hoặc click để chọn",
  maxFiles = 5,
  previewLayout = 'grid',
  disabled = false,
  onUploadingChange,
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);

  const images = Array.isArray(value) ? value : value ? [value] : [];

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || uploadingRef.current || disabled) return;

    if (multiple && images.length + files.length > maxFiles) {
      setError(`Bạn chỉ có thể tải lên tối đa ${maxFiles} ảnh.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    uploadingRef.current = true;
    setIsUploading(true);
    onUploadingChange?.(true);
    setError(null);
    const uploadedUrls: string[] = [];

    try {
      for (let index = 0; index < (multiple ? files.length : 1); index += 1) {
        const file = files[index];

        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} vượt quá 5MB.`);
        }

        const token = getToken();
        if (!token) {
          throw new Error("Bạn chưa đăng nhập.");
        }

        const data = await uploadAuthenticatedFile(
          `${API_BASE}${endpoint}`,
          token,
          file,
          "Upload thất bại",
        );
        if (!data?.url) throw new Error("Không nhận được đường dẫn ảnh sau khi tải lên.");
        uploadedUrls.push(data.url);
      }

      if (multiple) {
        onChange([...images, ...uploadedUrls]);
      } else {
        onChange(uploadedUrls[0]);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload thất bại");
    } finally {
      uploadingRef.current = false;
      setIsUploading(false);
      onUploadingChange?.(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    if (disabled || uploadingRef.current) return;
    if (multiple) {
      onChange(images.filter((_, index) => index !== indexToRemove));
      return;
    }

    onChange("");
  };

  return (
    <div className="space-y-4">
      {((!multiple && images.length === 0) || multiple) && (
        <div
          data-image-upload-dropzone=""
          role="button"
          aria-label={label}
          aria-disabled={disabled || isUploading}
          tabIndex={disabled || isUploading ? -1 : 0}
          className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-slate-50 hover:border-blue-400"
          } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500`}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled && !isUploading) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            void handleUpload(event.dataTransfer.files);
          }}
          onClick={() => { if (!disabled && !isUploading) fileInputRef.current?.click(); }}
          onKeyDown={event => {
            if ((event.key === 'Enter' || event.key === ' ') && !disabled && !isUploading) {
              event.preventDefault(); fileInputRef.current?.click();
            }
          }}
        >

          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-slate-600">Đang tải ảnh lên...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-bold text-slate-700">{label}</p>
              <p className="mt-1 text-xs text-slate-500">Hỗ trợ JPG, PNG, WEBP. Tối đa 5MB/ảnh.</p>
            </div>
          )}
        </div>
      )}

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple={multiple} disabled={disabled || isUploading} onChange={event => void handleUpload(event.target.files)} />

      {error && <p className="text-sm font-medium text-red-500">{error}</p>}

      {!multiple && images.length > 0 ? <div className="space-y-3">
        <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-[#dce9f7] bg-slate-50"><img src={images[0]} alt="Ảnh đã chọn" className="size-full object-cover" /></div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" disabled={disabled || isUploading} onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50">{isUploading ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}Thay ảnh</button>
          <button type="button" disabled={disabled || isUploading} onClick={() => removeImage(0)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"><X size={15} />Xóa ảnh</button>
        </div>
      </div> : images.length > 0 && multiple && previewLayout === 'carousel' ? <ImagePreviewCarousel images={images} disabled={disabled || isUploading} onRemove={removeImage} /> : images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((url, index) => (
            <div
              key={index}
              className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm"
            >
              <img src={url} alt={`Upload ${index}`} className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  disabled={disabled || isUploading}
                  aria-label={`Xóa ảnh ${index + 1}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeImage(index);
                  }}
                  className="flex h-8 w-8 scale-0 items-center justify-center rounded-full bg-red-500 text-white transition-all group-hover:scale-100 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
