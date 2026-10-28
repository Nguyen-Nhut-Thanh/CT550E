"use client";

import { ChatWorkspace } from "@/components/admin/chats/ChatWorkspace";
import { ConversationSidebar } from "@/components/admin/chats/ConversationSidebar";
import { useChatConversation } from "@/lib/chat/useChatConversation";
import { useChatSession } from "@/lib/chat/useChatSession";
import { useMemo, useState } from "react";


export default function AdminChatsPage() {
  const session = useChatSession();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const chat = useChatConversation(session.token, session.actor, selectedId);
  const selected =
    session.conversations.find((item) => item.conversation_id === selectedId) ??
    null;
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
            className="font-semibold underline"
          >
            Làm mới
          </button>
        </div>
      )}
      <div className="flex min-h-0 flex-1 gap-1.5 bg-blue-50/70 p-1.5">
        <ConversationSidebar
          conversations={visible}
          selectedId={selectedId}
          loading={!session.actor && !session.error}
          searchTerm={search}
          onSearchChange={setSearch}
          onRefresh={() => void session.refresh()}
          onSelect={setSelectedId}
        />
        <ChatWorkspace
          conversation={selected}
          messages={chat.messages}
          loading={chat.loading}
          hasMore={chat.hasMore}
          connected={chat.connected}
          typing={chat.typing}
          busy={false}
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
