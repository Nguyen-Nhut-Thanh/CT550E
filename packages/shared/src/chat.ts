import type { JwtPayload } from './auth';

export type AuthenticatedRequest = {
  user: {
    accountId?: number;
    sub: number;
    isStaff?: boolean;
    is_staff?: boolean;
  };
};

export type JwtChatPayload = Omit<JwtPayload, 'accountId'> & Partial<Pick<JwtPayload, 'accountId'>>;

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

export type PendingImage = {
  file: File;
  previewUrl: string;
};

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

export type ChatActor = { userId: number; accountId: number; isStaff: boolean; fullName: string };
export type ChatManageInput = { action: 'claim' | 'close' | 'reopen' | 'transfer'; staff_id?: number };
export type ChatStaff = { user_id: number; full_name: string };
export type ChatContextInput = { tour_id?: number; booking_id?: number };
export type ChatContextCard = { kind: 'tour' | 'booking'; id: number; title: string; url: string };
export type ChatMessagePage = { items: RealtimeMessage[]; has_more: boolean; next_cursor: number | null };
export type ChatAck = { error?: string; message?: RealtimeMessage; conversation_id?: number; success?: boolean };
export type ChatUpdate = { conversation_id: number; sender_role?: string; read?: boolean; reader_role?: 'USER' | 'STAFF'; through_message_id?: number };
export type ChatTypingEvent = { conversation_id: number; user_id: number; is_typing: boolean };
export type ChatDisplayMessage = RealtimeMessage & { delivery_status?: 'sending' | 'failed' };
export type ChatComposerProps = { disabled: boolean; placeholder?: string; onSend: (content: string, type?: 'TEXT' | 'IMAGE') => Promise<void>; onTyping: (value: boolean) => void };
export type ChatTimelineProps = { messages: ChatDisplayMessage[]; isStaff: boolean; loading: boolean; hasMore: boolean; onLoadMore: () => void; onRetry: (message: ChatDisplayMessage) => void; onVisible: (id: number) => void };
