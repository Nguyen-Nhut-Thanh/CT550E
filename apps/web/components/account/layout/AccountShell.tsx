"use client";

import { AccountResourceProvider } from "@/components/account/layout/AccountResourceProvider";
import { AccountSidebar } from "@/components/account/layout/AccountSidebar";
import { fetchMe, getToken } from "@/lib/auth/session";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { UserProfile } from "shared";

const AccountContext = createContext<{
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
} | null>(null);

export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error("useAccount must be used inside AccountShell");
  return account;
}

export function AccountShell({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState(false);
  const router = useRouter();
  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser((current) => (current ? { ...current, ...updates } : current));
  }, []);

  useEffect(() => {
    let active = true;
    const redirect = () =>
      router.replace(
        `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
      );
    async function load() {
      if (!getToken()) {
        redirect();
        return;
      }
      const data = await fetchMe();
      if (!active) return;
      if (data) {
        setUser(data);
        setError(false);
      } else if (!getToken()) {
        setUser(null);
        redirect();
      } else setError(true);
    }
    void load();
    const authChanged = () => {
      setUser(null);
      void load();
    };
    window.addEventListener("auth-change", authChanged);
    return () => {
      active = false;
      window.removeEventListener("auth-change", authChanged);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:grid lg:grid-cols-[268px_minmax(0,1fr)]">
      <AccountSidebar activeTab="" user={user} />
      <div className="min-w-0">
        {error ? (
          <div
            role="alert"
            className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-sm text-slate-600"
          >
            <AlertCircle className="text-rose-500" />
            <p>Không thể tải thông tin tài khoản.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-blue-600 px-5 py-2 text-white"
            >
              Thử lại
            </button>
          </div>
        ) : user ? (
          <AccountContext.Provider value={{ user, updateUser }}>
            <AccountResourceProvider key={user.user_id}>
              {children}
            </AccountResourceProvider>
          </AccountContext.Provider>
        ) : (
          <div
            role="status"
            className="flex min-h-[60vh] items-center justify-center gap-3 text-sm text-slate-500"
          >
            <Loader2 size={22} className="animate-spin text-blue-600" />
            Đang tải thông tin tài khoản...
          </div>
        )}
      </div>
    </div>
  );
}
