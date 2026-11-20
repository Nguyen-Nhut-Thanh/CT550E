"use client";

import { TourRecommendationCard } from "@/components/tour_cards/featured/UserTourRecommendationCard";
import { requestJson } from "@/lib/http/requestJson";
import { Bot, Headset, LoaderCircle, RotateCcw, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AiChatRequest, AiChatResponse, AiChatTourReference } from "shared";

const AI_CHAT_STORAGE_KEY = "journitrip_ai_chat_turns_v1";

function readStoredTurns(): Turn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AI_CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore
  }
  return [];
}

const starters = [
  { label: "Tìm tour Đà Lạt", message: "Tìm tour Đà Lạt 3 ngày dưới 4 triệu/người" },
  { label: "Tour cho gia đình", message: "Tư vấn tour cho gia đình có trẻ nhỏ" },
  { label: "Ưu đãi hiện có", message: "Xem ưu đãi hiện có", action: "offers" },
] satisfies { label: string; message: string; action?: AiChatRequest["action"] }[];

type Turn = {
  message: string;
  response: AiChatResponse;
};

export function AiChatView({ onContactSupport }: { onContactSupport?: () => void }) {
  const pathname = usePathname();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [quotingTourId, setQuotingTourId] = useState<number | null>(null);
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const request = useRef<AbortController | null>(null);
  const timeline = useRef<HTMLDivElement>(null);
  const latest = turns.at(-1)?.response;

  useEffect(() => {
    const stored = readStoredTurns();
    if (stored.length > 0) {
      setTurns(stored);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      if (turns.length === 0) {
        localStorage.removeItem(AI_CHAT_STORAGE_KEY);
      } else {
        localStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(turns.slice(-40)));
      }
    } catch {
      // ignore
    }
  }, [turns, loaded]);

  useEffect(() => {
    if (timeline.current) timeline.current.scrollTop = timeline.current.scrollHeight;
  }, [turns, pending, error]);

  useEffect(() => () => request.current?.abort(), []);

  async function send(message: string, action?: AiChatRequest["action"], explicit?: AiChatTourReference) {
    const clean = message.trim();
    if (!clean || request.current) return;

    const tourPage = pathname.match(/^\/tours\/([1-9]\d*)\/?$/);
    const currentTour = tourPage ? { tourId: Number(tourPage[1]) } : undefined;
    const controller = new AbortController();
    request.current = controller;
    setPending(clean);
    setError("");
    setDraft("");

    try {
      const response = await requestJson<AiChatResponse>("/ai/chat", {
        method: "POST",
        authMode: "auth",
        body: {
          message: clean,
          action,
          previousQuestions: turns.slice(-4).map((turn) => turn.message),
          tourReference: explicit ?? latest?.tourReference ?? currentTour,
          recentTours: latest?.tours.map((tour) => ({ tourId: tour.id, scheduleId: tour.schedule_id })),
        } satisfies AiChatRequest,
        signal: controller.signal,
      });
      setTurns((items) => [...items, { message: clean, response }]);
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : "Không gửi được câu hỏi. Bạn thử lại nhé.");
        if (!action) setDraft(clean);
      }
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setPending("");
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50">
      <div ref={timeline} role="log" aria-label="Hội thoại AI" className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3 sm:p-4">
        {turns.length === 0 && (
          <div className="space-y-3">
            <p className="rounded-2xl rounded-tl-sm bg-white p-3 text-sm text-slate-800 shadow-sm border border-slate-100">
              Bạn muốn đi đâu? Mình có thể tìm tour, tư vấn lịch trình, tính giá theo số khách và kiểm tra ưu đãi.
            </p>
            <div className="flex flex-wrap gap-2">
              {starters.map(({ label, message, ...item }) => (
                <button
                  key={label}
                  type="button"
                  disabled={Boolean(pending)}
                  onClick={() => void send(message, "action" in item ? item.action : undefined)}
                  className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-50 shadow-sm disabled:opacity-50"
                >{label}</button>
              ))}
            </div>
          </div>
        )}
        {turns.length > 0 && (
          <div className="flex items-center justify-between pb-1 text-[11px] text-slate-400 border-b border-slate-200/60">
            <span>Đang lưu lịch sử chat</span>
            <button
              type="button"
              onClick={() => {
                setTurns([]);
                try {
                  localStorage.removeItem(AI_CHAT_STORAGE_KEY);
                } catch {}
              }}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 transition"
              title="Xóa lịch sử và bắt đầu hội thoại mới"
            >
              <RotateCcw size={11} />
              <span>Làm mới hội thoại</span>
            </button>
          </div>
        )}
        {turns.map(({ message, response }, index) => (
          <div key={index} className="space-y-3">
            <p className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-blue-700 px-3 py-2 text-sm text-white shadow-sm">
              {message}
            </p>
            <p className="whitespace-pre-wrap break-words rounded-2xl rounded-tl-sm bg-white p-3 text-sm leading-relaxed text-slate-800 shadow-sm border border-slate-100">
              {response.reply}
            </p>
            {(response.reply.includes("số người lớn") || response.reply.includes("người lớn, trẻ em")) && (
              <div className="flex flex-wrap gap-1.5 px-1">
                {[
                  { label: "1 người lớn", msg: "1 người lớn" },
                  { label: "2 người lớn", msg: "2 người lớn" },
                  { label: "2 người lớn, 1 trẻ em", msg: "2 người lớn, 1 trẻ em" },
                  { label: "Gia đình (2 lớn, 2 trẻ em)", msg: "2 người lớn, 2 trẻ em" },
                ].map(({ label, msg }) => (
                  <button
                    key={label}
                    type="button"
                    disabled={Boolean(pending)}
                    onClick={() => void send(msg, "quote", response.tourReference)}
                    className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-50 shadow-sm disabled:opacity-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {response.tours.map((tour) => (
              <div key={tour.id} className="space-y-1">
                <TourRecommendationCard tour={tour} />
                <div className="flex justify-end gap-2 px-1">
                  <button
                    type="button"
                    disabled={Boolean(pending)}
                    onClick={() => void send(
                      `Tư vấn tour ${tour.title}`,
                      "advice", { tourId: tour.id, scheduleId: tour.schedule_id },
                    )}
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-50"
                  >Tư vấn</button>
                  <button
                    type="button"
                    disabled={Boolean(pending)}
                    onClick={() => {
                      if (quotingTourId === tour.id) {
                        setQuotingTourId(null);
                      } else {
                        setQuotingTourId(tour.id);
                        setAdultCount(2);
                        setChildCount(0);
                        setInfantCount(0);
                      }
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold disabled:opacity-50 ${quotingTourId === tour.id ? "bg-blue-700 text-white" : "text-blue-800 hover:bg-blue-100"}`}
                  >Tính giá</button>
                </div>

                {quotingTourId === tour.id && (
                  <div className="mt-2 rounded-2xl border border-blue-200 bg-blue-50/80 p-3 text-xs text-slate-800 shadow-md">
                    <div className="flex items-center justify-between pb-1.5 font-bold text-blue-900 border-b border-blue-200/60">
                      <span>Chọn số lượng khách tính giá:</span>
                      <button
                        type="button"
                        aria-label="Đóng"
                        onClick={() => setQuotingTourId(null)}
                        className="rounded p-0.5 text-slate-400 hover:text-slate-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="space-y-2 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800">Người lớn</span>
                          <span className="block text-[10px] text-slate-500">(từ 12 tuổi)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={adultCount <= 1}
                            onClick={() => setAdultCount((c) => Math.max(1, c - 1))}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                          >-</button>
                          <span className="w-5 text-center font-bold text-sm text-blue-900">{adultCount}</span>
                          <button
                            type="button"
                            disabled={adultCount >= 20}
                            onClick={() => setAdultCount((c) => Math.min(20, c + 1))}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                          >+</button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800">Trẻ em</span>
                          <span className="block text-[10px] text-slate-500">(5 - 11 tuổi)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={childCount <= 0}
                            onClick={() => setChildCount((c) => Math.max(0, c - 1))}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                          >-</button>
                          <span className="w-5 text-center font-bold text-sm text-blue-900">{childCount}</span>
                          <button
                            type="button"
                            disabled={childCount >= 20}
                            onClick={() => setChildCount((c) => Math.min(20, c + 1))}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                          >+</button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800">Em bé</span>
                          <span className="block text-[10px] text-slate-500">(dưới 5 tuổi)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={infantCount <= 0}
                            onClick={() => setInfantCount((c) => Math.max(0, c - 1))}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                          >-</button>
                          <span className="w-5 text-center font-bold text-sm text-blue-900">{infantCount}</span>
                          <button
                            type="button"
                            disabled={infantCount >= 10}
                            onClick={() => setInfantCount((c) => Math.min(10, c + 1))}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                          >+</button>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-blue-200/60 pt-2">
                      <button
                        type="button"
                        onClick={() => setQuotingTourId(null)}
                        className="rounded px-2.5 py-1 text-slate-500 hover:text-slate-700 font-medium"
                      >Hủy</button>
                      <button
                        type="button"
                        disabled={Boolean(pending)}
                        onClick={() => {
                          const parts = [`${adultCount} người lớn`];
                          if (childCount > 0) parts.push(`${childCount} trẻ em`);
                          if (infantCount > 0) parts.push(`${infantCount} em bé`);
                          const msg = `Tính giá tour ${tour.title} cho ${parts.join(", ")}`;
                          setQuotingTourId(null);
                          void send(msg, "quote", { tourId: tour.id, scheduleId: tour.schedule_id });
                        }}
                        className="rounded-lg bg-blue-700 px-3 py-1 font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50"
                      >Tính giá ngay</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        {pending && (
          <div className="space-y-2">
            <p className="ml-auto w-fit max-w-[85%] break-words rounded-2xl bg-blue-700 px-3 py-2 text-sm text-white shadow-sm">{pending}</p>
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <LoaderCircle size={15} className="animate-spin text-blue-700" /> Đang tra cứu…
            </p>
          </div>
        )}
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
      </div>
      <div className="shrink-0 border-t border-slate-200 bg-white p-3">
        <form className="flex gap-2" onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}>
          <input
            value={draft}
            maxLength={1000}
            onChange={(event) => setDraft(event.target.value)}
            aria-label="Câu hỏi về tour"
            placeholder="Nhập câu hỏi về tour..."
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-blue-600 sm:text-sm"
          />
          <button
            type="submit"
            disabled={!draft.trim() || Boolean(pending)}
            aria-label="Gửi câu hỏi"
            className="rounded-xl bg-blue-700 px-3.5 text-white hover:bg-blue-800 shadow-sm disabled:opacity-40 transition-colors"
          ><Send size={17} /></button>
        </form>
        {onContactSupport && (
          <button
            type="button"
            onClick={onContactSupport}
            className="mt-2 inline-flex items-center gap-1.5 rounded text-xs font-semibold text-slate-600 hover:text-blue-800 transition-colors"
          ><Headset size={14} /> Chuyển sang chat với tư vấn viên</button>
        )}
      </div>
    </div>
  );
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactSupport: () => void;
};

export function UserAiChat({ open, onOpenChange, onContactSupport }: Props) {
  return (
    <div className="fixed bottom-4 right-[5.5rem] z-[119] sm:right-[10.75rem]">
      {open && (
        <section
          aria-labelledby="journitrip-ai-title"
          className="fixed bottom-[4.75rem] right-4 flex h-[min(600px,calc(100dvh-120px))] w-[min(420px,calc(100vw-24px))] flex-col overflow-hidden rounded-[28px] border border-blue-100 bg-[#f3faff] shadow-[0_18px_60px_-12px_#5c7da860] sm:right-6"
        >
          <header className="flex shrink-0 items-center gap-3 bg-[#11459c] px-4 py-3 text-white">
            <Bot aria-hidden="true" size={24} />
            <h2 id="journitrip-ai-title" className="flex-1 font-bold">Trợ lý AI JourniTrip</h2>
            <button type="button" aria-label="Đóng trợ lý AI" onClick={() => onOpenChange(false)} className="rounded-lg p-1.5 hover:bg-white/15">
              <X size={19} />
            </button>
          </header>
          <AiChatView onContactSupport={onContactSupport} />
        </section>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
        onClick={() => onOpenChange(!open)}
        className="flex h-12 items-center gap-2 rounded-full bg-[#11459c] px-4 text-white shadow-lg hover:bg-blue-800"
      >
        <Bot size={21} />
        <span className="hidden text-sm font-semibold sm:inline">Trợ lý AI</span>
      </button>
    </div>
  );
}
