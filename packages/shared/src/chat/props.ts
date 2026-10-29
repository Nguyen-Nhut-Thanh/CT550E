import type { ChatDisplayMessage } from "./view-models";
import type { Conversation } from "./models";
export type ChatComposerProps = {
    disabled: boolean;
    placeholder?: string;
    onSend: (content: string, type?: 'TEXT' | 'IMAGE') => Promise<void>;
    onTyping: (value: boolean) => void;
    onShareTour?: () => void;
};
export type ChatTimelineProps = {
    messages: ChatDisplayMessage[];
    isStaff: boolean;
    customer?: Conversation["users"];
    loading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    onRetry: (message: ChatDisplayMessage) => void;
    onVisible: (id: number) => void;
};
