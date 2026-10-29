"use client";

import { GoogleAuthSection } from "@/components/auth/GoogleAuthSection";
import InlineNotice from "@/components/common/feedback/InlineNotice";
import { loginUser, loginWithGoogle } from "@/lib/auth/api";
import { setToken } from "@/lib/auth/session";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { GoogleCredentialResponse } from 'shared';

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerified = searchParams.get("verified") === "true";
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      setToken(data.access_token);
      router.push(callbackUrl === "/" ? "/account" : callbackUrl);
      router.refresh();
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Đăng nhập thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: GoogleCredentialResponse
  ) => {
    setError("");

    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      setToken(data.access_token);
      router.push(callbackUrl === "/" ? "/account" : callbackUrl);
      router.refresh();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Đăng nhập Google thất bại"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-900">Đăng nhập</h2>
        <p className="mt-2 text-sm text-slate-500">Dành cho khách du lịch</p>
      </div>

      {isVerified && !error && (
        <InlineNotice tone="success" className="px-4 py-3">
          Xác thực email thành công! Vui lòng đăng nhập tài khoản của bạn.
        </InlineNotice>
      )}

      {error && (
        <InlineNotice tone="error" className="px-4 py-3">
          {error}
        </InlineNotice>
      )}

      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">
            Email
          </label>
          <input
            type="email"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="example@gmail.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">
            Mật khẩu
          </label>
          <input
            type="password"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-400">Hoặc tiếp tục với</span>
        </div>
      </div>

      <GoogleAuthSection
        enabled={Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)}
        onSuccess={handleGoogleSuccess}
        onError={() => setError("Lỗi kết nối Google")}
      />

      <p className="text-center text-sm text-slate-600">
        Bạn chưa có tài khoản?{" "}
        <Link href="/register" className="font-bold text-blue-600 hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
