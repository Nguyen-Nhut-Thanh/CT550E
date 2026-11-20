"use client";

import { AiChatView } from "@/components/chat/ai_chat/UserAiChat";
import { ChatComposer } from "@/components/chat/chat_share/SharedChatComposer";
import { ChatReviewEditModal } from "@/components/reviews/customer_reviews/UserChatReviewEditModal";
import { ChatTimeline } from "@/components/chat/chat_share/SharedChatTimeline";
import { CustomerTourPicker } from "@/components/chat/customer_chat/UserCustomerTourPicker";
import { chatApi } from "@/lib/chat/api";
import { disconnectSocket } from "@/lib/chat/socket";
import { chatStatusLabel } from "@/lib/chat/support";
import { useChatConversation } from "@/lib/chat/useChatConversation";
import { useChatSession } from "@/lib/chat/useChatSession";
import { Bot, Check, ChevronDown, Headset, MessageCircle, Minus, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { ChatContextInput } from "shared";

const chatModes = [
  { value: "ai", label: "Trợ lý AI", desc: "Tư vấn tour, tính giá & ưu đãi tự động", icon: Bot },
  { value: "staff", label: "Tư vấn viên", desc: "Nhân viên hỗ trợ chuyến đi trực tiếp", icon: Headset },
] as const;
type ChatMode = (typeof chatModes)[number]["value"];

function ChatModePicker({ mode, onChange }: { mode: ChatMode; onChange: (mode: ChatMode) => void }) {
  const [expanded, setExpanded] = useState(false);
  const menuId = useId();
  const picker = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !picker.current?.contains(event.target)) setExpanded(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [expanded]);

  function closeAndFocus() {
    setExpanded(false);
    trigger.current?.focus();
  }

  return (
    <div
      ref={picker}
      className="relative shrink-0"
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !expanded) return;
        event.stopPropagation();
        closeAndFocus();
      }}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label={`Đổi hình thức tư vấn. Hiện tại: ${mode === "ai" ? "Trợ lý AI" : "Tư vấn viên"}`}
        aria-expanded={expanded}
        aria-controls={menuId}
        onClick={() => setExpanded((value) => !value)}
        className="flex min-h-6 items-center gap-1.5 whitespace-nowrap rounded-lg bg-white/20 px-2 py-0.5 text-[11px] font-semibold leading-4 text-blue-50 transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 shadow-sm"
      >
        <span>{mode === "ai" ? "Trợ lý AI" : "Tư vấn viên"}</span>
        <ChevronDown size={12} aria-hidden="true" className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>
      <div
        id={menuId}
        hidden={!expanded}
        role="group"
        aria-label="Chọn hình thức tư vấn"
        className="absolute left-0 top-full z-30 mt-1.5 w-60 rounded-2xl border border-blue-100 bg-white p-1.5 text-slate-700 shadow-xl"
      >
        <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Hình thức hỗ trợ</p>
        {chatModes.map(({ value, label, desc, icon: Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => {
              onChange(value);
              closeAndFocus();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition hover:bg-blue-50 focus-visible:outline-none aria-pressed:bg-blue-50 aria-pressed:text-blue-700"
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${mode === value ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"}`}>
              <Icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-800 leading-tight">{label}</p>
              <p className="text-[10px] text-slate-500 truncate">{desc}</p>
            </div>
            {mode === value && <Check size={14} className="text-blue-700 shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CustomerChat({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const session = useChatSession();
  const [mode, setMode] = useState<ChatMode>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("support-chat:mode");
      if (saved === "ai" || saved === "staff") return saved;
    }
    return "ai";
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [pending, setPending] = useState<ChatContextInput | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [showTourPicker, setShowTourPicker] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const contextSending = useRef(false);
  const tokenRef = useRef(session.token);
  tokenRef.current = session.token;

  useEffect(() => {
    try {
      sessionStorage.setItem("support-chat:mode", mode);
    } catch {}
  }, [mode]);
  const conversation = selected
    ? session.conversations.find((item) => item.conversation_id === selected)
    : session.conversations[0];
  const id = selected ?? conversation?.conversation_id ?? null;
  const chat = useChatConversation(
    session.actor?.isStaff ? null : session.token,
    session.actor,
    id,
  );
  const unread = session.conversations.reduce(
    (total, item) => total + item.unread_count,
    0,
  );

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("support-chat:context");
    if (stored) {
      try {
        setPending(JSON.parse(stored));
        setMode("staff");
        onOpenChange(true);
      } catch {
        sessionStorage.removeItem("support-chat:context");
      }
    }
    const show = (event: Event) => {
      const context = (event as CustomEvent<ChatContextInput | undefined>)
        .detail;
      onOpenChange(true);
      setMode("staff");
      setError("");
      if (context) {
        setPending(context);
        sessionStorage.setItem("support-chat:context", JSON.stringify(context));
      }
    };
    window.addEventListener("support-chat:open", show);
    return () => window.removeEventListener("support-chat:open", show);
  }, [onOpenChange]);

  useEffect(() => {
    setSelected(null);
    setError("");
  }, [session.token]);

  useEffect(() => {
    if (
      !open ||
      mode !== "staff" ||
      !session.actor ||
      session.actor.isStaff ||
      id ||
      creating ||
      error ||
      session.error
    )
      return;
    const token = session.token;
    setCreating(true);
    void chatApi
      .create()
      .then((row) => {
        if (tokenRef.current === token) {
          setSelected(row.conversation_id);
          void session.refresh();
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setCreating(false));
  }, [
    open,
    mode,
    session.actor,
    session.token,
    session.error,
    session.refresh,
    id,
    creating,
    error,
  ]);

  useEffect(() => {
    if (!open || !pending || !chat.connected || contextSending.current || error)
      return;
    contextSending.current = true;
    void chat
      .send("Yêu cầu tư vấn", "CONTEXT", pending)
      .then(() => {
        setPending(null);
        sessionStorage.removeItem("support-chat:context");
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => {
        contextSending.current = false;
      });
  }, [open, pending, chat.connected, chat.send, error]);

  return (
    <div className="fixed bottom-4 right-4 z-[120] sm:right-6">
      {open && (
        <section
          aria-label={mode === "ai" ? "Trợ lý AI" : "Chat với nhân viên"}
          className="mb-3 flex h-[min(600px,calc(100dvh-120px))] w-[min(420px,calc(100vw-24px))] flex-col overflow-hidden rounded-[28px] border border-blue-100 bg-[#f3faff] shadow-[0_18px_60px_-12px_#5c7da860]"
        >
          <header className="flex shrink-0 items-center gap-2.5 border-b border-white/10 bg-gradient-to-r from-[#165de8] to-[#2548bc] px-4 py-3 text-white">
            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 shadow-sm">
              {mode === "ai" ? <Bot size={20} /> : <Headset size={20} strokeWidth={1.8} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <p className="text-[15px] font-bold tracking-tight">JourniTrip</p>
                <ChatModePicker mode={mode} onChange={setMode} />
              </div>
              <p className="mt-0.5 truncate text-[11px] leading-4 text-blue-100">
                {mode === "ai"
                  ? "Tư vấn tour, tính giá & ưu đãi tự động 24/7"
                  : session.actor && !session.actor.isStaff
                    ? conversation?.assigned_staff?.full_name ||
                      (conversation
                        ? chatStatusLabel(conversation.status)
                        : "Kết nối với nhân viên")
                    : "Hỗ trợ chuyến đi của bạn"}
              </p>
            </div>
            <button
              type="button"
              aria-label="Thu nhỏ chat"
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-blue-50 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <Minus size={18} />
            </button>
          </header>

          <div className={`min-h-0 flex-1 flex-col overflow-hidden ${mode === "ai" ? "flex" : "hidden"}`}>
            <AiChatView onContactSupport={() => setMode("staff")} />
          </div>

          <div className={`min-h-0 flex-1 flex-col overflow-hidden ${mode === "staff" ? "flex" : "hidden"}`}>
            {!session.actor?.isStaff && session.conversations.length > 1 && (
              <select
                aria-label="Chọn lịch sử tư vấn"
                value={id ?? ""}
                onChange={(event) => setSelected(Number(event.target.value))}
                className="border-b bg-white px-3 py-2 text-xs"
              >
                {session.conversations.map((item) => (
                  <option key={item.conversation_id} value={item.conversation_id}>
                    Trao đổi #{item.conversation_id}
                    {item.unread_count
                      ? ` · ${item.unread_count} tin chưa đọc`
                      : ""}
                  </option>
                ))}
              </select>
            )}
            {!session.token ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center bg-white">
                <MessageCircle size={36} className="text-blue-500" />
                <p className="text-sm leading-6 text-slate-600">
                  Đăng nhập để nhắn trực tiếp với nhân viên và lưu lại lịch sử tư
                  vấn.
                </p>
                <Link
                  href="/login"
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700"
                >
                  Đăng nhập để chat
                </Link>
                <button
                  type="button"
                  onClick={() => setMode("ai")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
                >
                  <Sparkles size={14} /> Hoặc hỏi nhanh Trợ lý AI (không cần đăng nhập)
                </button>
              </div>
            ) : session.actor?.isStaff ? (
              <div className="flex flex-1 items-center justify-center bg-white">
                <Link href="/admin/chats" className="font-semibold text-blue-600">
                  Mở hộp thư nhân viên →
                </Link>
              </div>
            ) : (
              <>
                {(error || session.error || chat.error) && (
                  <div
                    role="alert"
                    className="bg-amber-50 px-3 py-2 text-xs text-amber-800"
                  >
                    {error || session.error || chat.error}{" "}
                    <button
                      type="button"
                      className="font-bold underline"
                      onClick={() => {
                        setError("");
                        chat.reload();
                        void session.refresh();
                      }}
                    >
                      Thử lại
                    </button>
                  </div>
                )}
                {pending && (
                  <div className="flex items-center gap-2 border-b bg-blue-50 px-3 py-2 text-xs text-blue-700">
                    <span className="flex-1">
                      {pending.booking_id
                        ? `Hỗ trợ đơn #${pending.booking_id}`
                        : `Tư vấn tour #${pending.tour_id}`}
                    </span>
                    <button
                      type="button"
                      aria-label="Bỏ thông tin tư vấn"
                      onClick={() => {
                        setPending(null);
                        sessionStorage.removeItem("support-chat:context");
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <ChatTimeline
                  key={`timeline:${session.token}:${id}`}
                  messages={chat.messages}
                  isStaff={false}
                  loading={chat.loading || creating || !session.actor}
                  hasMore={chat.hasMore}
                  onLoadMore={() => void chat.loadMore()}
                  onRetry={chat.retry}
                  onVisible={chat.markRead}
                  onViewReview={setSelectedReviewId}
                />
                {(!chat.connected || chat.typing || conversation?.status === "CLOSED" || conversation?.status === "WAITING") && (
                  <p className="bg-slate-50 px-4 py-1 text-[11px] text-slate-500">
                    {!chat.connected
                      ? "Đang kết nối…"
                      : chat.typing
                        ? "Nhân viên đang nhập…"
                        : conversation?.status === "CLOSED"
                          ? "Đã giải quyết · Gửi tin mới để tiếp tục hỗ trợ"
                          : conversation?.status === "WAITING"
                            ? "Nhân viên sẽ sớm trả lời bạn"
                            : null}
                  </p>
                )}
                <ChatComposer
                  key={`composer:${session.token}:${id}`}
                  disabled={!chat.connected || !id}
                  onSend={chat.send}
                  onTyping={chat.sendTyping}
                  onShareTour={() => setShowTourPicker(true)}
                />
                {showTourPicker && <CustomerTourPicker disabled={!chat.connected || !id} onSend={chat.send} onClose={() => setShowTourPicker(false)} />}
                {selectedReviewId && (
                  <ChatReviewEditModal
                    reviewId={selectedReviewId}
                    isOpen={Boolean(selectedReviewId)}
                    onClose={() => setSelectedReviewId(null)}
                    onSuccess={() => {
                      void chat.send("Tôi vừa cập nhật lại bài đánh giá tour.", "TEXT");
                    }}
                  />
                )}
              </>
            )}
          </div>
        </section>
      )}
      <button
        type="button"
        aria-label={
          open
            ? "Đóng chat"
            : `Mở chat JourniTrip${unread && mode === "staff" ? `, ${unread} tin chưa đọc` : ""}`
        }
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="relative ml-auto flex h-12 items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 px-5 font-semibold text-white shadow-xl transition-all duration-200 hover:from-blue-700 hover:to-indigo-800 hover:shadow-2xl"
      >
        {open ? (
          <X size={22} />
        ) : mode === "ai" ? (
          <Bot size={22} />
        ) : (
          <MessageCircle size={22} />
        )}
        <span className="hidden text-sm sm:inline">{mode === "ai" ? "Trợ lý AI" : "Chat tư vấn"}</span>
        {unread > 0 && mode === "staff" && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs ring-2 ring-white font-bold">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}
