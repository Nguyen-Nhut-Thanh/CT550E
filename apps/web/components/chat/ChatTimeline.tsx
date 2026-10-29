"use client";

import { UserRound } from "lucide-react";
import { TourMessageCard } from "./TourMessageCard";
import { formatMessageTime } from "@/lib/chat/format";
import { DEFAULT_AVATAR, resolveAvatar } from "@/lib/account/avatar";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { ChatTimelineProps } from "shared";

export function ChatTimeline({
  messages,
  isStaff,
  customer,
  loading,
  hasMore,
  onLoadMore,
  onRetry,
  onVisible,
}: ChatTimelineProps) {
  const container = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const previous = useRef({ first: 0, height: 0 });
  const latest = Math.max(0, ...messages.map((item) => item.message_id));
  const markVisible = useCallback(() => {
    if (nearBottom.current && latest) onVisible(latest);
  }, [latest, onVisible]);

  useLayoutEffect(() => {
    const el = container.current;
    if (!el) return;
    const first = messages.find((item) => item.message_id > 0)?.message_id ?? 0;
    if (previous.current.first && first && first < previous.current.first)
      el.scrollTop += el.scrollHeight - previous.current.height;
    else if (nearBottom.current) el.scrollTop = el.scrollHeight;
    previous.current = { first, height: el.scrollHeight };
    markVisible();
  }, [messages, markVisible]);
  useEffect(() => {
    window.addEventListener("focus", markVisible);
    document.addEventListener("visibilitychange", markVisible);
    return () => {
      window.removeEventListener("focus", markVisible);
      document.removeEventListener("visibilitychange", markVisible);
    };
  }, [markVisible]);

  return (
    <div
      ref={container}
      onScroll={() => {
        const el = container.current;
        if (!el) return;
        nearBottom.current =
          el.scrollHeight - el.scrollTop - el.clientHeight < 70;
        markVisible();
      }}
      className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#f3f8fb] p-4"
      style={{ backgroundImage: "radial-gradient(ellipse at 0% 100%, #dceeff 0%, transparent 55%), radial-gradient(ellipse at 100% 0%, #e7f5ff 0%, transparent 50%)" }}
      aria-label="Lịch sử tin nhắn"
    >
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="mx-auto mb-3 block rounded-full border bg-white px-4 py-1.5 text-xs text-blue-600"
        >
          Xem tin nhắn trước
        </button>
      )}
      {loading && (
        <p className="py-3 text-center text-sm text-slate-400">
          Đang tải tin nhắn…
        </p>
      )}
      {!loading && !messages.length && (
        <p className="mx-auto max-w-xs py-12 text-center text-sm leading-6 text-slate-500">
          Gửi lời nhắn để nhân viên tư vấn chuyến đi cho bạn.
        </p>
      )}
      {messages.map((message, index) => {
        const own = isStaff
          ? message.sender_role !== "USER"
          : message.sender_role === "USER";
        const previousMessage = messages[index - 1];
        const continuesGroup = previousMessage?.sender_id === message.sender_id &&
          previousMessage?.sender_role === message.sender_role;
        const changesType = previousMessage?.message_type !== message.message_type ||
          previousMessage?.context?.kind !== message.context?.kind;
        const sender = isStaff && customer?.user_id === message.sender_id ? customer : null;
        return (
          <div
            key={message.client_message_id || message.message_id}
            className={`flex min-w-0 items-start gap-3 ${index === 0 ? "" : !continuesGroup ? "mt-3" : changesType ? "mt-[5px]" : "mt-0.5"} ${own ? "justify-end" : "justify-start"}`}
          >
            {!own && <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e1e8f1] font-semibold text-[#6b829f] ${continuesGroup ? "invisible" : ""}`}>
              {sender?.avatar_url ? (
                <img src={resolveAvatar(sender.avatar_url)} alt="" className="h-full w-full object-cover" onError={event => {
                  if (!event.currentTarget.src.endsWith(DEFAULT_AVATAR)) event.currentTarget.src = DEFAULT_AVATAR;
                }} />
              ) : sender?.full_name ? sender.full_name.trim().charAt(0).toUpperCase() : <UserRound size={18} />}
            </span>}
            <div className={`flex min-w-0 flex-col ${message.context?.kind === "tour" ? "w-full max-w-[600px]" : "max-w-[80%]"} ${own ? "items-end" : "items-start"}`}>
            <div
              className={`${message.context?.kind === "tour" ? "w-full min-w-0" : "w-fit max-w-full"} rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${(message.message_type === "IMAGE" || message.context?.kind === "tour") ? "!border-0 !bg-transparent !p-0 !shadow-none" : own && isStaff ? "bg-blue-500 text-white" : `${own ? "rounded-br-md" : "rounded-bl-md"} border border-[#e8eef4] bg-white text-slate-800 shadow-[0_1px_3px_rgba(50,75,100,0.1)]`}`}
            >
              {message.message_type === "IMAGE" ? (
                <a
                  href={message.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Mở ảnh đầy đủ"
                  className={`flex max-w-full ${own ? "justify-end" : "justify-start"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={message.content}
                    alt="Ảnh trong hội thoại"
                    className="h-auto max-h-40 w-auto max-w-[min(100%,200px)] rounded-lg object-contain"
                    loading="lazy"
                    onLoad={() => {
                      const el = container.current;
                      if (el && nearBottom.current)
                        el.scrollTop = el.scrollHeight;
                    }}
                  />
                </a>
              ) : message.message_type === "CONTEXT" ? (
                <div className="space-y-1">
                  <p className={`text-[10px] font-semibold uppercase opacity-70 ${message.context?.kind === "tour" ? "hidden" : ""}`}>
                    {message.context?.kind === "booking"
                      ? "Hỗ trợ đơn đặt tour"
                      : "Tư vấn tour"}
                  </p>
                  {message.context?.kind === "tour" ? <TourMessageCard context={message.context} /> : message.context &&
                  !(isStaff && message.context.kind === "booking") ? (
                    <a
                      href={message.context.url}
                      className="font-semibold underline underline-offset-2"
                    >
                      {message.content}
                    </a>
                  ) : (
                    <p className="font-semibold">{message.content}</p>
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                  {message.content}
                </p>
              )}
            </div>
              {index === messages.length - 1 && <div
                className={`mt-1.5 flex gap-1.5 px-2 text-[11px] text-[#8ba1bf] ${own ? "justify-end" : "justify-start"}`}
              >
                <time dateTime={message.created_at}>
                  {formatMessageTime(message.created_at)}
                </time>
                {own && (
                  <span>
                    {message.delivery_status === "sending"
                      ? "Đang gửi…"
                      : message.delivery_status === "failed"
                        ? "Chưa gửi"
                        : message.is_read
                          ? "Đã đọc"
                          : "Đã gửi"}
                  </span>
                )}
              </div>}
              {message.delivery_status === "failed" && (
                <button
                  type="button"
                  onClick={() => onRetry(message)}
                  className="mt-1 text-xs font-semibold underline"
                >
                  Gửi lại
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
