"use client";

import { requestJson } from "@/lib/http/requestJson";
import { formatVND } from "@/lib/utils/currency";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { TourCompareResult } from "shared";

interface Props {
  open: boolean;
  onClose: () => void;
  tourIds: number[];
}

const LOADING_STEPS = [
  "Đang đọc dữ liệu lịch trình chi tiết...",
  "Đang đối chiếu khách sạn, phương tiện & chi phí...",
  "Đang tổng hợp bảng so sánh và lời khuyên AI...",
];

export function TourComparisonModal({ open, onClose, tourIds }: Props) {
  const [data, setData] = useState<TourCompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!open || tourIds.length < 2) return;

    let timer: NodeJS.Timeout;
    setStepIndex(0);
    timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1800);

    setLoading(true);
    setError("");

    requestJson<TourCompareResult>("/ai/compare-tours", {
      method: "POST",
      body: { tourIds },
    })
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Không thể so sánh các tour lúc này.");
      })
      .finally(() => {
        setLoading(false);
        clearInterval(timer);
      });

    return () => clearInterval(timer);
  }, [open, tourIds]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative flex h-[min(760px,94dvh)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-2xl z-10">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <Sparkles size={20} />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                So sánh Tour Du lịch Thông minh
              </h2>
              <p className="text-xs text-blue-100">
                Phân tích & đối chiếu đa chiều tự động bởi AI
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Đóng so sánh"
            onClick={onClose}
            className="rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </header>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {loading ? (
            <div className="flex h-80 flex-col items-center justify-center text-center space-y-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Loader2 size={32} className="animate-spin" />
                <Sparkles size={16} className="absolute top-2 right-2 text-amber-500 animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {LOADING_STEPS[stepIndex]}
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                AI đang xử lý ma trận đối chiếu dịch vụ và rút trích các điểm khác biệt...
              </p>
            </div>
          ) : error ? (
            <div className="flex h-80 flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-rose-100">
              <p className="text-sm font-bold text-rose-600 mb-2">Đã có lỗi xảy ra</p>
              <p className="text-xs text-slate-500 mb-4">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Đóng
              </button>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* AI Quick Verdict */}
              <section className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-2 font-bold text-blue-900 text-sm">
                  <Sparkles size={17} className="text-blue-600" />
                  <span>Đánh giá chốt hạ của AI (Verdict)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium mb-3">
                  {data.verdict.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 border-t border-blue-200/60">
                  {data.verdict.best_for.map((item) => (
                    <div
                      key={item.tour_id}
                      className="rounded-xl bg-white/90 p-3 border border-blue-100 shadow-2xs text-xs"
                    >
                      <p className="font-bold text-blue-800 mb-1 line-clamp-1">
                        🎯 {item.tour_name}
                      </p>
                      <p className="text-slate-600 leading-normal">
                        {item.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Comparison Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="p-3 sm:p-4 font-bold text-slate-700 w-36 sm:w-48 shrink-0">
                        Tiêu chí
                      </th>
                      {data.tours.map((tour) => (
                        <th
                          key={tour.tour_id}
                          className="p-3 sm:p-4 align-top min-w-[200px]"
                        >
                          <div className="space-y-2">
                            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
                              <img
                                src={tour.image_url}
                                alt={tour.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <h3 className="font-bold text-slate-900 line-clamp-2 text-xs sm:text-sm leading-snug">
                              {tour.name}
                            </h3>
                            <div className="text-blue-700 font-extrabold text-sm sm:text-base">
                              {formatVND(tour.price)}
                            </div>
                            <Link
                              href={tour.link}
                              onClick={onClose}
                              className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                            >
                              Đặt tour này
                            </Link>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.criteria_matrix.map((row, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
                      >
                        <td className="p-3 sm:p-4 font-bold text-slate-800 align-top">
                          {row.criterion}
                        </td>
                        {data.tours.map((tour) => (
                          <td
                            key={tour.tour_id}
                            className="p-3 sm:p-4 text-slate-600 align-top leading-relaxed text-xs sm:text-[13px]"
                          >
                            {row.values[tour.tour_id] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Key Trade-off */}
              {data.key_tradeoff && (
                <section className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 text-xs sm:text-sm text-slate-800 shadow-2xs">
                  <p className="font-bold text-amber-900 mb-1">
                    ⚖️ Đánh đổi lớn nhất (Key Trade-off):
                  </p>
                  <p className="leading-relaxed font-medium text-amber-950">
                    {data.key_tradeoff}
                  </p>
                </section>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

