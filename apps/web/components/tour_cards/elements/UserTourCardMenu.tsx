"use client";

import { useTourCompare, type CompareTourItem } from "@/lib/hooks/useTourCompare";
import { Check, Copy, MessageSquareText, MoreHorizontal, Scale } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  tour: CompareTourItem;
  className?: string;
}

export function TourCardMenu({ tour, className = "" }: Props) {
  const { isComparing, toggleTour } = useTourCompare();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = isComparing(tour.tour_id);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const url = `${window.location.origin}/tours/${tour.tour_id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1200);
  }

  function handleCompare(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    toggleTour(tour);
    setOpen(false);
  }

  function handleAskAi(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setOpen(false);
    try {
      sessionStorage.setItem(
        "support-chat:context",
        JSON.stringify({ tour_id: tour.tour_id, title: tour.name }),
      );
      sessionStorage.setItem("support-chat:open", "true");
      sessionStorage.setItem("support-chat:mode", "ai");
      window.dispatchEvent(new Event("storage"));
    } catch {}
  }

  return (
    <div ref={menuRef} className={`relative z-30 inline-block text-left ${className}`}>
      <button
        type="button"
        aria-label="Tùy chọn tour"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen((prev) => !prev);
        }}
        className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full transition shadow-xs focus-visible:outline-none ${
          selected
            ? "bg-blue-600 text-white shadow-blue-500/20"
            : "bg-white/90 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
        }`}
      >
        <MoreHorizontal className="h-4 w-4" />
        {selected && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-slate-100 bg-white/95 p-1 text-xs text-slate-700 shadow-xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            type="button"
            onClick={handleCompare}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-semibold transition ${
              selected
                ? "bg-blue-50 text-blue-700"
                : "hover:bg-slate-50 text-slate-800"
            }`}
          >
            {selected ? (
              <Check className="h-3.5 w-3.5 text-blue-700 shrink-0" />
            ) : (
              <Scale className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            )}
            <span>{selected ? "Bỏ chọn so sánh" : "So sánh tour này"}</span>
          </button>

          <button
            type="button"
            onClick={handleAskAi}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-800 transition"
          >
            <MessageSquareText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span>Hỏi AI về tour</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <Copy className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span>{copied ? "Đã chép link!" : "Sao chép liên kết"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

