"use client";

import { useAdminContentReadOnly } from '@/components/admin/common/AdminContentPermission';


import { TourPoliciesEditor } from "@/components/admin/tours/editor/TourPoliciesEditor";
import { TourEditorCard } from "@/components/admin/tours/editor/TourEditorCard";
import { ImageWithFallback } from "@/components/common/media/ImageWithFallback";
import { TourPolicyContent } from "@/components/tours/detail/TourPolicyContent";
import { getAdminTourDetail, updateAdminTour } from "@/lib/admin/tours/api";
import { normalizeTourDetailForm } from "@/lib/admin/tours/forms";
import { useToast } from "@/lib/notifications/useToast";
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Loader2,
  MapPinned,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  TOUR_POLICY_DEFINITIONS,
  type TourDetailForm,
  type TourPolicyKey,
} from "shared";

export default function AdminTourPoliciesPage() {
  const readOnly = useAdminContentReadOnly();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const [tour, setTour] = useState<TourDetailForm | null>(null);
  const [activeKey, setActiveKey] = useState<TourPolicyKey>("included");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    getAdminTourDetail<TourDetailForm>(id)
      .then((data) => {
        const result = normalizeTourDetailForm(data.tour);
        if (!result) throw new Error("Không tìm thấy tour.");
        if (active) setTour(result);
      })
      .catch((error) => {
        if (active)
          setLoadError(
            error instanceof Error
              ? error.message
              : "Không thể tải lưu ý tour.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, retry]);

  const handleSave = async () => {
    if (!tour || savingRef.current || loading || loadError) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await updateAdminTour(id, {
        policy_contents: tour.policy_contents || {},
      });
      showSuccess("Đã lưu lưu ý tour");
      router.push("/admin/tours");
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Không thể lưu lưu ý tour.",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={30} className="animate-spin text-blue-600" />
      </div>
    );
  if (loadError || !tour)
    return (
      <div
        role="alert"
        className="mx-auto max-w-3xl rounded-2xl border border-rose-100 bg-rose-50 p-5 text-[13px] leading-6 text-rose-700"
      >
        <p>{loadError || "Không tìm thấy tour."}</p>
        <div className="mt-3 flex gap-4">
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="font-semibold underline"
          >
            Thử lại
          </button>
          <Link href="/admin/tours" className="font-semibold underline">
            Quay lại quản lý tour
          </Link>
        </div>
      </div>
    );

  const activePolicy =
    TOUR_POLICY_DEFINITIONS.find((policy) => policy.key === activeKey) ||
    TOUR_POLICY_DEFINITIONS[0];
  const content = tour.policy_contents?.[activeKey] || "";
  const completed = TOUR_POLICY_DEFINITIONS.filter((policy) =>
    tour.policy_contents?.[policy.key]?.trim(),
  ).length;
  const percentage = Math.round(
    (completed / TOUR_POLICY_DEFINITIONS.length) * 100,
  );
  const photo = Array.isArray(tour.images) ? tour.images[0] : tour.images;

  return (
    <div className="relative isolate mx-auto max-w-[1280px] pt-2 pb-4 text-[#102044] before:absolute before:inset-x-[-24px] before:inset-y-0 before:-z-[1] before:bg-[radial-gradient(ellipse_at_20%_0%,#f8fcff_0%,#f0f7ff_45%,#eaf4ff_100%)] before:content-[''] lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:pb-0">
      <header className="mb-4 flex shrink-0 items-start gap-3">
        <button
          type="button"
          disabled={readOnly || saving}
          onClick={() => router.push("/admin/tours")}
          aria-label="Quay lại quản lý tour"
          className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[10px] border border-[#e0e9f5] bg-white text-[#627491] shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-50"
        >
          <ArrowLeft size={17} />
        </button>
        <div>
          <h1 className="text-[22px] leading-[1.25] font-extrabold tracking-[-.8px] text-[#101d40] sm:text-[24px]">
            Lưu ý tour
          </h1>
          <p className="mt-1 text-[12px] leading-5 text-[#7b8aa3]">
            Thiết lập thông tin cần biết cho tour {tour.name || ""}
          </p>
        </div>
      </header>
      <div className="grid items-start gap-4 lg:min-h-0 lg:flex-1 lg:items-stretch lg:grid-cols-[minmax(0,1.9fr)_minmax(270px,1fr)] lg:grid-rows-[minmax(0,1fr)]">
        <TourEditorCard
          compact
          fillHeight
          title="Nội dung lưu ý"
          description="Quản lý các nội dung quan trọng hiển thị trên trang chi tiết tour."
          icon={MapPinned}
        >
          <TourPoliciesEditor
            value={tour.policy_contents}
            onChange={(policy_contents) =>
              setTour((previous) =>
                previous ? { ...previous, policy_contents } : previous,
              )
            }
            activeKey={activeKey}
            onActiveChange={setActiveKey}
            disabled={readOnly || saving}
          />
        </TourEditorCard>
        <aside className="min-w-0 lg:h-full lg:min-h-0">
          <TourEditorCard
            compact
            fillHeight
            title="Xem trước hiển thị"
            description="Nội dung hiển thị tương ứng với mục bạn đang chỉnh sửa."
            icon={Eye}
          >
            <div className="overflow-hidden rounded-[12px] border border-[#e2eaf5] bg-[linear-gradient(150deg,#fff,#f8fbff)] lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
              <ImageWithFallback
                src={photo || ""}
                alt={tour.name || "Ảnh tour"}
                className="aspect-[16/7] w-full object-cover"
              />
              <div className="space-y-2.5 p-3">
                <h2 className="text-[15px] leading-5 font-bold tracking-[-.3px] text-[#102044]">
                  {tour.name || "Tour du lịch"}
                </h2>
                <div className="rounded-[10px] border border-[#e4ebf5] bg-white p-3">
                  <h3 className="mb-2 text-[12px] font-bold leading-5 text-[#173052]">
                    {activePolicy.title}
                  </h3>
                  <div
                    className="pr-1"
                    aria-live="polite"
                  >
                    {content.trim() ? (
                      <TourPolicyContent
                        content={content}
                        included={activeKey === "included"}
                      />
                    ) : (
                      <p className="text-[12px] leading-6 text-[#98a5b9]">
                        Chưa có nội dung cho mục này.
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  href={`/tours/${id}#tour-policies`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0766ff] hover:underline"
                >
                  <ExternalLink size={14} />
                  Xem trang tour
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
            <div className="mt-4 shrink-0 border-t border-[#e5edf7] pt-3">
              <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-medium text-[#52627e]">
                  Đã hoàn thiện {completed}/{TOUR_POLICY_DEFINITIONS.length} mục
                </span>
                <span className="text-[#8490a5]">{percentage}%</span>
              </div>
              <div
                role="progressbar"
                aria-label="Tiến độ hoàn thiện lưu ý tour"
                aria-valuemin={0}
                aria-valuemax={TOUR_POLICY_DEFINITIONS.length}
                aria-valuenow={completed}
                className="h-1.5 overflow-hidden rounded-full bg-[#e9eff7]"
              >
                <div
                  className="h-full rounded-full bg-[#0766ff] transition-[width] duration-200"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="mt-4 grid grid-cols-[1.4fr_1fr] gap-2.5">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={readOnly || saving}
                  className="flex min-h-10 items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(135deg,#1679ff,#075bea)] px-3 py-2.5 text-[12px] font-semibold text-white shadow-sm shadow-blue-100 transition-colors hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-wait disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  disabled={readOnly || saving}
                  onClick={() => router.push("/admin/tours")}
                  className="min-h-10 rounded-[10px] border border-[#d4dfef] bg-white px-3 py-2.5 text-[12px] font-semibold text-[#263b5c] hover:bg-[#f5f9ff] focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </TourEditorCard>
        </aside>
      </div>
    </div>
  );
}
