"use client";

import { useAdminContentReadOnly } from '@/components/common/admin_shared/guards/AdminContentPermission';


import { TourPoliciesEditor } from "@/components/tours/tour_policies/AdminTourPoliciesEditor";
import { TourEditorCard } from "@/components/tours/tour_editor/AdminTourEditorCard";
import { ImageWithFallback } from "@/components/common/dialogs_and_feedback/media/ImageWithFallback";
import { TourPolicyContent } from "@/components/tour_detail/policies/UserTourPolicyContent";
import { getAdminTourDetail, updateAdminTour } from "@/lib/tours/admin/api";
import { normalizeTourDetailForm } from "@/lib/tours/admin/forms";
import { useToast } from "@/lib/notifications/useToast";
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Loader2,
  MapPin,
  MapPinned,
  Plane,
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
    <div className="relative isolate mx-auto max-w-[1240px] px-2 pt-2 pb-16 text-[#0b1747] before:absolute before:-z-[2] before:inset-x-[-28px] before:top-[-16px] before:bottom-0 before:content-[''] before:bg-[radial-gradient(ellipse_at_25%_8%,#fff_0%,#f2f7ff_44%,#eaf3ff_100%)]">
      {/* Header Banner phong cách Tour Editor */}
      <div className="relative isolate -mx-2 -mt-2 mb-4 overflow-hidden rounded-b-[20px] bg-[linear-gradient(110deg,#f8fbff,#edf6ff)] px-3 pt-2 pb-4">
        <div
          className="absolute inset-y-0 right-0 -z-[1] w-[56%] bg-no-repeat [background-image:linear-gradient(90deg,#f5faff_0%,#f5faffcc_18%,#f5faff00_55%),linear-gradient(0deg,#eff6ff_0%,#eff6ff00_38%),url('/images/about/hero-bay-traveler.png')] [background-size:auto,auto,200%_auto] [background-position:center,center,left_49%] max-sm:w-[66%] max-sm:opacity-50"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-0 right-[28%] h-[66px] w-[180px] text-[#5592b8] max-sm:hidden [&>svg:first-child]:h-full [&>svg:first-child]:w-full"
          aria-hidden="true"
        >
          <svg viewBox="0 0 200 70" fill="none">
            <path
              d="M10 52C38 1 100-2 151 26"
              stroke="#a7cffc"
              strokeWidth="1.5"
              strokeDasharray="5 5"
            />
          </svg>
          <MapPin
            className="absolute top-[37px] left-0"
            size={18}
            fill="#5a9bfa"
            stroke="white"
          />
          <Plane
            className="absolute top-0 right-2 rotate-[17deg]"
            size={42}
            strokeWidth={1.4}
            fill="#dcefff"
          />
        </div>
        <header className="relative px-2 pt-1 pb-1">
          <div className="flex max-w-[76%] items-start gap-3.5 max-sm:max-w-full">
            <button
              type="button"
              disabled={readOnly || saving}
              onClick={() => router.push("/admin/tours")}
              aria-label="Quay lại quản lý tour"
              className="mt-1 grid size-9 shrink-0 place-items-center rounded-xl border border-[#dce6f4] bg-white text-[#627491] shadow-xs hover:border-[#98bcfb] hover:text-[#1260eb] transition cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="uppercase text-[10px] tracking-wider text-[#4e709b] font-extrabold bg-white/80 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Chính sách &amp; Lưu ý
                </span>
                {tour.code && (
                  <span className="text-xs font-mono font-bold text-[#075bff]">
                    #{tour.code}
                  </span>
                )}
              </div>
              <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-[-.8px] text-[#07123e] leading-[1.25]">
                Lưu ý tour: {tour.name || ""}
              </h1>
              <p className="mt-1 text-[13px] leading-[1.6] text-[#637da5] max-w-[620px]">
                Thiết lập thông tin cần biết, quyền lợi và chính sách áp dụng hiển thị trên trang chi tiết tour.
              </p>
            </div>
          </div>
        </header>
      </div>

      <div className="grid items-start gap-4 lg:min-h-0 lg:flex-1 lg:items-stretch lg:grid-cols-[minmax(0,1.9fr)_minmax(280px,1fr)] lg:grid-rows-[minmax(0,1fr)]">
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
            <div className="overflow-hidden rounded-[14px] border border-[#e1edfc] bg-gradient-to-br from-white to-[#f8fbff] shadow-2xs lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
              <ImageWithFallback
                src={photo || ""}
                alt={tour.name || "Ảnh tour"}
                className="aspect-[16/7] w-full object-cover"
              />
              <div className="space-y-2.5 p-3.5">
                <h2 className="text-[15px] leading-5 font-bold tracking-[-.3px] text-[#0b1747]">
                  {tour.name || "Tour du lịch"}
                </h2>
                <div className="rounded-[12px] border border-[#e1edfc] bg-white p-3 shadow-2xs">
                  <h3 className="mb-2 text-[12px] font-bold leading-5 text-[#075bff]">
                    {activePolicy.title}
                  </h3>
                  <div className="pr-1" aria-live="polite">
                    {content.trim() ? (
                      <TourPolicyContent
                        content={content}
                        included={activeKey === "included"}
                      />
                    ) : (
                      <p className="text-[12px] leading-6 text-slate-400 italic">
                        Chưa có nội dung cho mục này.
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  href={`/tours/${id}#tour-policies`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#075bff] hover:underline"
                >
                  <ExternalLink size={13} />
                  <span>Xem trang tour thực tế</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
            <div className="mt-4 shrink-0 border-t border-[#edf2fb] pt-3">
              <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-semibold text-slate-600">
                  Đã hoàn thiện {completed}/{TOUR_POLICY_DEFINITIONS.length} mục
                </span>
                <span className="font-extrabold text-[#075bff]">{percentage}%</span>
              </div>
              <div
                role="progressbar"
                aria-label="Tiến độ hoàn thiện lưu ý tour"
                aria-valuemin={0}
                aria-valuemax={TOUR_POLICY_DEFINITIONS.length}
                aria-valuenow={completed}
                className="h-2 overflow-hidden rounded-full bg-slate-100"
              >
                <div
                  className="h-full rounded-full bg-[#075bff] transition-[width] duration-200"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="mt-4 grid grid-cols-[1.4fr_1fr] gap-2.5">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={readOnly || saving}
                  className="flex min-h-10 items-center justify-center gap-2 rounded-[12px] bg-[#075bff] hover:bg-[#064ddd] px-4 py-2.5 text-xs font-[650] text-white shadow-sm transition cursor-pointer disabled:cursor-wait disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
                </button>
                <button
                  type="button"
                  disabled={readOnly || saving}
                  onClick={() => router.push("/admin/tours")}
                  className="min-h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-[650] text-slate-700 transition cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </TourEditorCard>
        </aside>
      </div>

      {/* Họa tiết chân trang SVG giống TourEditorShell */}
      <svg
        className="pointer-events-none absolute right-[-20px] bottom-0 -z-[1] h-[180px] w-[60%] opacity-50"
        viewBox="0 0 700 200"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 200 145 135 205 160 330 55 400 100 490 20 580 95 640 75 700 110V200Z"
          fill="#e0edfd"
        />
        <path
          d="m190 200 180-105 32 25 83-84 55 77 52-24L700 159v41Z"
          fill="#cde3fc"
        />
        <path
          d="m437 87 48-51 34 48-24-9-10 8-11-17-17 26Z"
          fill="#f8fbff"
        />
        <path
          d="m310 200 170-68 53 25 90-34 77 48v29Z"
          fill="#b8d6f7"
        />
      </svg>
    </div>
  );
}
