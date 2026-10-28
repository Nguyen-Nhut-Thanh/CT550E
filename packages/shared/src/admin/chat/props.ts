import type { ChatContextInput } from "../../chat/contracts";
import type { Conversation } from "../../chat/models";
import type { ChatComposerProps } from "../../chat/props";
import type { ChatDisplayMessage } from "../../chat/view-models";
export type ChatWorkspaceProps = {
    conversation: Conversation | null;
    messages: ChatDisplayMessage[];
    loading: boolean;
    hasMore: boolean;
    connected: boolean;
    typing: boolean;
    busy: boolean;
    onBack: () => void;
    onSend: (content: string, type?: 'TEXT' | 'IMAGE' | 'CONTEXT', context?: ChatContextInput) => Promise<void>;
    onTyping: ChatComposerProps['onTyping'];
    onLoadMore: () => void;
    onRetry: (message: ChatDisplayMessage) => void;
    onVisible: (id: number) => void;
};
export type ConversationSidebarProps = {
    conversations: Conversation[];
    selectedId: number | null;
    loading: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onRefresh: () => void;
    onSelect: (conversationId: number) => void;
};
