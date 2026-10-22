import type { Conversation } from 'shared';
import { API_BASE } from "./auth";
export const API_BASE_URL = API_BASE.replace(/\/+$/, "");

export function formatConversationTime(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getConversationPreview(conversation: Conversation) {
  if (!conversation.last_message) return "Bắt đầu cuộc trò chuyện";

  return conversation.last_message === "[Image]"
    ? "Đã gửi một ảnh"
    : conversation.last_message;
}

