import type { ChatContextInput } from 'shared';

export function openSupportChat(context?: ChatContextInput) {
  window.dispatchEvent(new CustomEvent<ChatContextInput | undefined>('support-chat:open', { detail: context }));
}

export function chatStatusLabel(status: string) {
  return status === 'CLOSED' ? 'Đã hoàn thành' : 'Đang hỗ trợ';
}
