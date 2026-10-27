"use client";

import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatTimeline } from "@/components/chat/ChatTimeline";
import { chatApi } from "@/lib/chat/api";
import { chatStatusLabel } from "@/lib/chat/support";
import { useChatConversation } from "@/lib/chat/useChatConversation";
import { useChatSession } from "@/lib/chat/useChatSession";
import { MessageCircle, Minus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ChatContextInput } from "shared";

export function CustomerChat() {
  const session = useChatSession();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [pending, setPending] = useState<ChatContextInput | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const contextSending = useRef(false);
  const tokenRef = useRef(session.token);
  tokenRef.current = session.token;
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
    const stored = sessionStorage.getItem("support-chat:context");
    if (stored) {
      try {
        setPending(JSON.parse(stored));
        setOpen(true);
      } catch {
        sessionStorage.removeItem("support-chat:context");
      }
    }
    const show = (event: Event) => {
      const context = (event as CustomEvent<ChatContextInput | undefined>)
        .detail;
      setOpen(true);
      setError("");
      if (context) {
        setPending(context);
        sessionStorage.setItem("support-chat:context", JSON.stringify(context));
      }
    };
    window.addEventListener("support-chat:open", show);
    return () => window.removeEventListener("support-chat:open", show);
  }, []);

  useEffect(() => {
    setSelected(null);
    setError("");
  }, [session.token]);
  useEffect(() => {
    if (
      !open ||
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
    <div className="fixed bottom-5 right-4 z-50 sm:right-6">
      {open && (
        <section
          aria-label="Chat với nhân viên"
          className="mb-3 flex h-[min(600px,calc(100dvh-180px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div>
              <p className="font-bold">JourniTrip · Tư vấn viên</p>
              <p className="text-xs text-blue-100">
                {session.actor && !session.actor.isStaff
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
              onClick={() => setOpen(false)}
              className="rounded-full p-2 hover:bg-blue-500"
            >
              <Minus size={18} />
            </button>
          </header>
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
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
              <MessageCircle size={36} className="text-blue-500" />
              <p className="text-sm leading-6 text-slate-600">
                Đăng nhập để nhắn trực tiếp với nhân viên và lưu lại lịch sử tư
                vấn.
              </p>
              <Link
                href="/login"
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white"
              >
                Đăng nhập để chat
              </Link>
            </div>
          ) : session.actor?.isStaff ? (
            <div className="flex flex-1 items-center justify-center">
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
              />
              <p className="bg-slate-50 px-4 py-1 text-[11px] text-slate-500">
                {!chat.connected
                  ? "Đang kết nối…"
                  : chat.typing
                    ? "Nhân viên đang nhập…"
                    : conversation?.status === "CLOSED"
                      ? "Đã giải quyết · Gửi tin mới để tiếp tục hỗ trợ"
                      : conversation?.status === "WAITING"
                        ? "Tin nhắn sẽ được nhân viên tiếp nhận"
                        : "Đã kết nối với nhân viên"}
              </p>
              <ChatComposer
                key={`composer:${session.token}:${id}`}
                disabled={!chat.connected || !id}
                onSend={chat.send}
                onTyping={chat.sendTyping}
              />
            </>
          )}
        </section>
      )}
      <button
        type="button"
        aria-label={
          open
            ? "Đóng chat"
            : `Chat với nhân viên${unread ? `, ${unread} tin chưa đọc` : ""}`
        }
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative ml-auto flex h-14 items-center gap-2 rounded-full bg-blue-600 px-5 font-semibold text-white shadow-lg transition hover:bg-blue-700"
      >
        {open ? <X size={22} /> : <MessageCircle size={23} />}
        <span className="hidden text-sm sm:inline">Chat tư vấn</span>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs ring-2 ring-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}
