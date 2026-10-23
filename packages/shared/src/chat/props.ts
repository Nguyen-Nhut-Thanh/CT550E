import type { ChatDisplayMessage } from "./view-models";
export type ChatComposerProps = {
    disabled: boolean;
    placeholder?: string;
    onSend: (content: string, type?: 'TEXT' | 'IMAGE') => Promise<void>;
    onTyping: (value: boolean) => void;
};
export type ChatTimelineProps = {
    messages: ChatDisplayMessage[];
    isStaff: boolean;
    loading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    onRetry: (message: ChatDisplayMessage) => void;
    onVisible: (id: number) => void;
};
