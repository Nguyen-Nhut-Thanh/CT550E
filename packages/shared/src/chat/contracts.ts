import type { RealtimeMessage } from "./models";
export type JoinPayload = {
    conversation_id?: number;
};
export type SendPayload = {
    conversation_id: number;
    content: string;
    message_type?: 'TEXT' | 'IMAGE' | 'CONTEXT';
    client_message_id?: string;
    context?: ChatContextInput;
};
export type TypingPayload = {
    conversation_id: number;
    is_typing: boolean;
};
export type ReadPayload = {
    conversation_id: number;
    through_message_id?: number;
};
export type ChatManageInput = {
    action: 'claim' | 'close' | 'reopen' | 'transfer';
    staff_id?: number;
};
export type ChatContextInput = {
    tour_id?: number;
    booking_id?: number;
};
export type ChatMessagePage = {
    items: RealtimeMessage[];
    has_more: boolean;
    next_cursor: number | null;
};
export type ChatAck = {
    error?: string;
    message?: RealtimeMessage;
    conversation_id?: number;
    success?: boolean;
};
export type ChatUpdate = {
    conversation_id: number;
    sender_role?: string;
    read?: boolean;
    reader_role?: 'USER' | 'STAFF';
    through_message_id?: number;
};
export type ChatTypingEvent = {
    conversation_id: number;
    user_id: number;
    is_typing: boolean;
};
