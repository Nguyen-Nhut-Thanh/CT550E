"use client";


import { ImageUpload } from "@/components/common/ImageUpload";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { AlertCircle, GripVertical, Image as ImageIcon, Star, Trash2 } from "lucide-react";
import type { AdminLocationItem } from 'shared';

export function FeaturedLocationsRightPanel({
  featured,
  onMoveItem,
  onToggleSelect,
  onImageChange,
}: {
  featured: AdminLocationItem[];
  onMoveItem: (index: number, direction: "up" | "down") => void;
  onToggleSelect: (location: AdminLocationItem) => void;
  onImageChange: (index: number, value: string | null) => void;
}) {
  return (
    <div className="space-y-4 lg:col-span-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 p-5">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900">
            <Star size={16} className="fill-amber-500 text-amber-500" />
            Thứ tự hiển thị ({featured.length}/9)
          </h3>
        </div>

        <div className="custom-scrollbar max-h-[750px] space-y-4 overflow-y-auto p-6">
          {featured.length === 0 ? (
            <div className="space-y-3 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 py-20 text-center">
              <Star className="mx-auto text-slate-200" size={40} />
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Chọn địa điểm từ bên trái để bắt đầu
              </p>
            </div>
          ) : (
            featured.map((location, index) => {
              const hasNoImage =
                !location.featured_image &&
                (!location.location_images || location.location_images.length === 0);

              return (
                <div
                  key={location.location_id}
                  className="group rounded-2xl border border-slate-200 border-l-4 border-l-blue-600 bg-white p-4 transition-all hover:shadow-md"
                >
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center gap-1 rounded-xl bg-slate-50 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => onMoveItem(index, "up")}
                        disabled={index === 0}
                        className="p-1 text-slate-300 transition-all hover:text-blue-500 disabled:opacity-0"
                      >
                        <GripVertical size={16} />
                      </button>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white">
                        {index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => onMoveItem(index, "down")}
                        disabled={index === featured.length - 1}
                        className="p-1 text-slate-300 transition-all hover:text-blue-500 disabled:opacity-0"
                      >
                        <GripVertical size={16} />
                      </button>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-base font-bold text-slate-900">{location.name}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`rounded border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                                index === 0 || index === 5
                                  ? "border-amber-100 bg-amber-50 text-amber-600"
                                  : "border-slate-100 bg-slate-50 text-slate-500"
                              }`}
                            >
                              {index === 0 || index === 5 ? "Ô lớn" : "Ô tiêu chuẩn"}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onToggleSelect(location)}
                          className="rounded-xl p-2 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="border-t border-slate-50 pt-3">
                        <div className="flex flex-col gap-6 md:flex-row">
                          <div className="w-full shrink-0 md:w-32">
                            <label className="mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                              Ảnh mặc định
                            </label>
                            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                              {location.location_images?.[0]?.image_url ? (
                                <ImageWithFallback
                                  src={location.location_images[0].image_url}
                                  className="h-full w-full object-cover"
                                  alt={location.name}
                                />
                              ) : (
                                <ImageIcon size={16} className="text-slate-200" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1 space-y-2">
                            <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <ImageIcon size={14} className="text-blue-400" />
                              Ảnh hiển thị riêng (Ghi đè)
                            </label>
                            <ImageUpload
                              value={location.featured_image ? [location.featured_image] : []}
                              endpoint="/admin/locations/upload"
                              onChange={(urls) =>
                                onImageChange(
                                  index,
                                  Array.isArray(urls) ? urls[0] || null : urls || null,
                                )
                              }
                              label="Chỉ upload nếu muốn dùng ảnh khác ảnh mặc định"
                            />
                            {hasNoImage && (
                              <p className="flex items-center gap-1 text-[10px] font-bold italic text-rose-500">
                                <AlertCircle size={10} />
                                Địa điểm này chưa có hình ảnh mặc định.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
