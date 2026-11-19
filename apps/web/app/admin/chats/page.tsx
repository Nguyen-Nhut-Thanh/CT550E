"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatWorkspace } from "@/components/chat/admin_chat/AdminChatWorkspace";
import { ConversationSidebar } from "@/components/chat/admin_chat/AdminConversationSidebar";
import { disconnectSocket } from "@/lib/chat/socket";
import { useChatConversation } from "@/lib/chat/useChatConversation";
import { useChatSession } from "@/lib/chat/useChatSession";

export default function AdminChatsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center bg-blue-50/70 text-xs text-slate-500">
          Đang tải không gian chat...
        </div>
      }
    >
      <AdminChatsContent />
    </Suspense>
  );
}

function AdminChatsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlConversationId = searchParams.get("conversationId");
  const urlInitialText = searchParams.get("initialText");
  const urlTourName = searchParams.get("tourName");
  const urlRating = searchParams.get("rating");
  const urlReviewId = searchParams.get("reviewId");

  const session = useChatSession();
  const [selectedId, setSelectedId] = useState<number | null>(
    urlConversationId ? Number(urlConversationId) : null,
  );
  const [search, setSearch] = useState("");
  const chat = useChatConversation(session.token, session.actor, selectedId);
  const selected =
    session.conversations.find((item) => item.conversation_id === selectedId) ??
    null;

  const isTargetReviewConv = Boolean(
    urlConversationId && selectedId === Number(urlConversationId),
  );

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (urlConversationId) {
      const convId = Number(urlConversationId);
      setSelectedId(convId);
    }
  }, [urlConversationId]);

  const handleSelectConversation = (id: number) => {
    setSelectedId(id);
    // Replace URL to clean up initialText, reviewId, tourName, etc.
    router.replace(`/admin/chats?conversationId=${id}`);
  };

  const visible = useMemo(
    () =>
      session.conversations.filter((item) => {
        return (
          `${item.users?.full_name ?? ""} ${item.last_message ?? ""} ${item.user_id}`
            .toLocaleLowerCase("vi")
            .includes(search.toLocaleLowerCase("vi"))
        );
      }),
    [session.conversations, search],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      {(session.error || chat.error) && (
        <div
          role="alert"
          className="flex items-center gap-3 border-b bg-amber-50 px-4 py-2 text-xs text-amber-800"
        >
          <span className="flex-1">{session.error || chat.error}</span>
          <button
            type="button"
            onClick={() => {
              chat.reload();
              void session.refresh();
            }}
            className="font-semibold underline cursor-pointer"
          >
            Làm mới
          </button>
        </div>
      )}

      {/* Chat Space */}
      <div className="flex min-h-0 flex-1 gap-1.5 bg-blue-50/70 p-1.5">
        <ConversationSidebar
          conversations={visible}
          selectedId={selectedId}
          loading={!session.actor && !session.error}
          searchTerm={search}
          onSearchChange={setSearch}
          onRefresh={() => void session.refresh()}
          onSelect={handleSelectConversation}
        />
        <ChatWorkspace
          conversation={selected}
          messages={chat.messages}
          loading={chat.loading}
          hasMore={chat.hasMore}
          connected={chat.connected}
          typing={chat.typing}
          busy={false}
          initialText={isTargetReviewConv ? (urlInitialText || undefined) : undefined}
          reviewBanner={
            isTargetReviewConv && urlTourName
              ? {
                  tourName: urlTourName,
                  rating: urlRating,
                  reviewId: urlReviewId,
                }
              : undefined
          }
          onBack={() => setSelectedId(null)}
          onSend={chat.send}
          onTyping={chat.sendTyping}
          onLoadMore={() => void chat.loadMore()}
          onRetry={chat.retry}
          onVisible={chat.markRead}
        />
      </div>
    </div>
  );
}
