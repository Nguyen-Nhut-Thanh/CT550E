import { getToken } from '@/lib/auth';
import { requestWithToken } from '@/lib/requestWithToken';
import type { ChatActor, ChatManageInput, ChatMessagePage, ChatStaff, Conversation, UploadResponse } from 'shared';

export async function chatRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  if (!token) throw new Error('Vui lòng đăng nhập để chat');
  return requestWithToken<T>(`/chat${path}`, {
    ...init, cache: 'no-store', headers: { ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...init?.headers },
  });
}

export const chatApi = {
  me: () => chatRequest<ChatActor>('/me'),
  list: () => chatRequest<Conversation[]>('/conversations'),
  create: () => chatRequest<Conversation>('/conversations', { method: 'POST' }),
  staff: () => chatRequest<ChatStaff[]>('/staff'),
  messages: (id: number, cursor = '') => chatRequest<ChatMessagePage>(`/conversations/${id}/messages${cursor}`),
  manage: (id: number, body: ChatManageInput) => chatRequest(`/conversations/${id}/manage`, { method: 'POST', body: JSON.stringify(body) }),
  upload: async (file: File) => {
    const body = new FormData(); body.append('file', file);
    return (await chatRequest<UploadResponse>('/upload-image', { method: 'POST', body })).url;
  },
};
