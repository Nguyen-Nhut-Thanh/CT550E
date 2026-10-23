export type Conversation = {
    conversation_id: number;
    user_id: number;
    status: string;
    last_message: string | null;
    last_message_at: string;
    unread_count: number;
    assigned_staff_id?: number | null;
    assigned_staff?: ChatStaff | null;
    users?: {
        user_id: number;
        full_name: string;
        avatar_url: string | null;
    } | null;
};
export type RealtimeMessage = {
    message_id: number;
    conversation_id: number;
    sender_id: number;
    sender_role: "USER" | "ADMIN" | "STAFF";
    message_type: "TEXT" | "IMAGE" | "CONTEXT";
    client_message_id?: string | null;
    context?: ChatContextCard | null;
    content: string;
    is_read: boolean;
    created_at: string;
};
export type ChatStaff = {
    user_id: number;
    full_name: string;
};
export type ChatContextCard = {
    kind: 'tour' | 'booking';
    id: number;
    title: string;
    url: string;
};

export type ChatActor = {
    userId: number;
    accountId: number;
    isStaff: boolean;
    fullName: string;
};
