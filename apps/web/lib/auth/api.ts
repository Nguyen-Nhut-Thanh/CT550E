import { requestJson } from "@/lib/http/requestJson";
import type { LoginResponse } from 'shared';

export function loginUser(email: string, password: string) {
  return requestJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    fallbackMessage: "Đăng nhập thất bại",
  });
}

export function loginWithGoogle(token: string | undefined) {
  return requestJson<LoginResponse>("/auth/google", {
    method: "POST",
    body: { token },
    fallbackMessage: "Đăng nhập Google thất bại",
  });
}

export function registerUser(payload: {
  email: string;
  password: string;
  full_name: string;
}) {
  return requestJson("/auth/register", {
    method: "POST",
    body: payload,
    fallbackMessage: "Đăng ký thất bại",
  });
}

export function verifyEmailCode(email: string | null, code: string) {
  return requestJson("/auth/verify-email", {
    method: "POST",
    body: { email, code },
    fallbackMessage: "Xác thực thất bại",
  });
}

export function resendVerificationCode(email: string) {
  return requestJson("/auth/resend-verification", {
    method: "POST",
    body: { email },
    fallbackMessage: "Không thể gửi lại mã",
  });
}
