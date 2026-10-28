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
        phone?: string | null;
        address?: string | null;
        created_at?: string;
        accounts?: { email: string };
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
    image_url?: string;
    price?: number;
    duration?: string;
    schedule_id?: number;
    departure_date?: string;
    original_price?: number;
    summary?: string;
    destination?: string;
    transport?: string;
    meals?: string;
    hotel?: string;
    rating?: number;
    rating_count?: number;
    category?: string;
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
