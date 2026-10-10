"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { fetchMe, getToken } from "@/lib/client/utils/auth";
import { AccountSidebar, AccountWalletTab } from "@/components/account";
import type { UserProfile } from "shared";

export default function WalletAccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const initData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const userData = await fetchMe();
      if (!userData) {
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      setUser(userData as UserProfile);
    } catch {
      setError("Không thể tải thông tin ví.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    initData();
  }, [initData]);

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb]">
        <div className="rounded-2xl border border-slate-100 bg-white px-10 py-12 text-center shadow-sm">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-600">Đang tải ví thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-14 w-14 text-rose-500" />
          <h2 className="mb-2 text-xl font-bold text-slate-900">Đã có lỗi xảy ra</h2>
          <p className="mb-6 text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:grid lg:grid-cols-[268px_minmax(0,1fr)]">
      <AccountSidebar activeTab="wallet" user={user} />
      <main className="min-w-0 p-6 lg:p-8">
        <AccountWalletTab />
      </main>
    </div>
  );
}

