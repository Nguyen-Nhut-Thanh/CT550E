"use client";

import { useAdminContentReadOnly } from "@/components/common/admin_shared/guards/AdminContentPermission";
import { AdminEditorCard } from "@/components/common/admin_shared/cards/AdminEditorCard";
import { AdminPageHeader } from "@/components/common/admin_shared/layout/AdminPageHeader";
import { fetchAdminBannerDetail, saveAdminBanner, uploadAdminBannerImage } from "@/lib/banners/admin/api";
import { useToast } from "@/lib/notifications/useToast";
import { AlignLeft, ArrowLeft, Camera, Globe, Link2, Loader2, Save, ToggleLeft, Type, X } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

export default function AdminBannerDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center rounded-[14px] border border-[#e1edfc] bg-white p-8 shadow-2xs">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <AdminBannerDetailContent />
    </Suspense>
  );
}

function AdminBannerDetailContent() {
  const readOnly = useAdminContentReadOnly();
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const backUrl =
    pageParam && Number(pageParam) > 1
      ? `/admin/banners?page=${pageParam}`
      : "/admin/banners";
  const { success, error: showError } = useToast();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    location_name: "",
    header: "",
    description: "",
    image_url: "",
    link_to: "",
    status: 1,
  });

  useEffect(() => {
    if (!isNew) {
      const loadData = async () => {
        try {
          const data = await fetchAdminBannerDetail(String(id));
          setForm({
            location_name: data.location_name || "",
            header: data.header || "",
            description: data.description || "",
            image_url: data.image_url || "",
            link_to: data.link_to || "",
            status: data.status ?? 1,
          });
        } catch {
          showError("Lỗi tải thông tin banner");
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [id, isNew, showError]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await uploadAdminBannerImage(file);
      setForm((prev) => ({ ...prev, image_url: data.url }));
      success("Tải ảnh lên thành công");
    } catch {
      showError("Lỗi khi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveAdminBanner(form, isNew ? undefined : String(id));
      success(isNew ? "Đã tạo banner mới thành công" : "Đã cập nhật banner");
      router.push(backUrl);
      router.refresh();
    } catch {
      showError("Lỗi khi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-[14px] border border-[#e1edfc] bg-white p-8 shadow-2xs">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs sm:text-sm font-medium">Đang tải thông tin banner...</span>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          aria-label="Quay lại danh sách banner"
          onClick={() => router.push(backUrl)}
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#dce6f4] bg-white text-[#627491] shadow-2xs transition-colors hover:border-[#98bcfb] hover:text-[#1260eb] cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <AdminPageHeader
            title={isNew ? "Thêm Banner Mới" : "Chỉnh sửa Banner"}
            description="Cấu hình nội dung và hình ảnh hiển thị trên trang chủ website."
          />
        </div>
      </div>

      {/* Info notice banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#e1edfc] bg-gradient-to-r from-blue-50/70 via-sky-50/50 to-indigo-50/50 px-4 py-3 text-xs leading-5 text-blue-800 shadow-2xs">
        <p>
          Banner sẽ hiển thị ở phần đầu trang chủ (Hero Banner). Khuyên dùng ảnh chất lượng cao độ phân giải 1920x1080 (tỷ lệ 16:9).
        </p>
      </div>

      {/* Main Grid with gap-[22px] matching Tour Add/Edit */}
      <div className="grid gap-[22px] lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
        {/* Left Column: Nội dung hiển thị */}
        <div className="flex min-w-0 flex-col gap-[22px]">
          <AdminEditorCard
            id="banner-content"
            title="Nội dung hiển thị"
            description="Tiêu đề, địa điểm và mô tả quảng bá trên banner."
            icon={Type}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <Globe size={14} className="text-slate-400" /> Tên địa điểm
                  </label>
                  <input
                    className="w-full rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] px-3.5 py-2 text-sm font-bold text-slate-900 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_#e8f1ff]"
                    placeholder="VD: Vịnh Hạ Long"
                    value={form.location_name}
                    onChange={(e) =>
                      setForm({ ...form, location_name: e.target.value })
                    }
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <Type size={14} className="text-slate-400" /> Tiêu đề chính <span className="text-rose-500">*</span>
                  </label>
                  <input
                    className="w-full rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] px-3.5 py-2 text-sm font-bold text-slate-900 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_#e8f1ff]"
                    placeholder="VD: Khám phá kỳ quan thế giới"
                    value={form.header}
                    onChange={(e) => setForm({ ...form, header: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <Link2 size={14} className="text-slate-400" /> Đường dẫn liên kết khi nhấn banner
                </label>
                <input
                  className="w-full rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] px-3.5 py-2 text-xs sm:text-sm text-slate-800 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_#e8f1ff]"
                  placeholder="VD: /tours?destination=ha-long hoặc https://..."
                  value={form.link_to}
                  onChange={(e) => setForm({ ...form, link_to: e.target.value })}
                />
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <AlignLeft size={14} className="text-slate-400" /> Mô tả ngắn
                </label>
                <textarea
                  className="min-h-[120px] w-full resize-none rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] px-3.5 py-2 text-xs sm:text-sm text-slate-700 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_#e8f1ff]"
                  placeholder="Nội dung mô tả banner hiển thị bên dưới tiêu đề..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            </div>
          </AdminEditorCard>
        </div>

        {/* Right Column (Sidebar): Hình ảnh & Cài đặt */}
        <aside
          className="flex min-w-0 flex-col gap-[22px] lg:self-stretch"
          aria-label="Hình ảnh và cài đặt banner"
        >
          {/* Card 1: Hình ảnh banner */}
          <AdminEditorCard
            id="banner-image"
            title="Hình ảnh banner"
            description="Kích thước khuyên dùng tỷ lệ 16:9 chất lượng cao."
            icon={Camera}
          >
            <div className="space-y-3.5">
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`relative aspect-[16/9] rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                  form.image_url
                    ? "border-[#e1edfc]"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-400"
                }`}
              >
                {form.image_url ? (
                  <>
                    <img
                      src={form.image_url}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="text-white" size={24} />
                    </div>
                  </>
                ) : (
                  <>
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    ) : (
                      <>
                        <Camera className="text-slate-400 mb-2" size={32} />
                        <span className="text-xs font-bold text-slate-600">
                          Tải ảnh lên
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Khuyên dùng ảnh tỷ lệ 16:9 (1920x1080)
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              {form.image_url && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image_url: "" })}
                  className="w-full py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center gap-2 border border-rose-100 cursor-pointer"
                >
                  <X size={14} /> Gỡ bỏ ảnh hiện tại
                </button>
              )}
            </div>
          </AdminEditorCard>

          {/* Card 2: Cài đặt hiển thị & Thao tác (Cố định khi cuộn tới) */}
          <div className="lg:sticky lg:top-4 lg:z-10">
            <AdminEditorCard
              id="banner-settings"
              title="Cài đặt hiển thị"
              description="Trạng thái hiển thị và thao tác lưu banner."
              icon={ToggleLeft}
              className="shadow-[0_4px_16px_#3869a712]"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Trạng thái hiển thị
                  </label>
                  <div className="flex gap-1.5 rounded-xl border border-[#dfe6f1] bg-[#f8faff] p-1">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, status: 1 }))}
                      className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                        form.status === 1
                          ? "bg-white text-emerald-700 shadow-2xs border border-emerald-100"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Đang hiển thị
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, status: 0 }))}
                      className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                        form.status === 0
                          ? "bg-white text-slate-700 shadow-2xs border border-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Đang ẩn
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={readOnly || saving || !form.header || !form.image_url}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    {isNew ? "Hoàn tất & Lưu" : "Lưu thay đổi"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(backUrl)}
                    className="w-full rounded-xl border border-[#e1edfc] bg-white py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            </AdminEditorCard>
          </div>
        </aside>
      </div>
    </div>
  );
}
