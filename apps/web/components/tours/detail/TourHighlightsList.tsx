"use client";

import { CheckCircle2, Award } from "lucide-react";

type TourHighlightsListProps = {
  highlights?: string[];
};

export default function TourHighlightsList({ highlights = [] }: TourHighlightsListProps) {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
          <Award className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Điểm nổi bật của chương trình</h2>
      </div>

      <div className="space-y-2.5">
        {highlights.map((text, idx) => (
          <div key={idx} className="flex items-start gap-3 rounded-xl bg-slate-50/60 p-3 border border-slate-100/80">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-sky-600 mt-0.5" />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
