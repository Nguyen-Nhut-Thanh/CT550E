"use client";
import { workforceApi } from '@/lib/admin/workforce/api';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import type { WorkforceActor } from 'shared';

const WorkforceIdentity = createContext<WorkforceActor | null>(null);
export function useWorkforceIdentity() { return useContext(WorkforceIdentity); }
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<WorkforceActor | null>(null);
  const [error, setError] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    let active = true;
    const check = async () => {
      try { const actor = await workforceApi.me(); if (active) { setIdentity(actor); setError(''); } }
      catch (e) { if (active) { setIdentity(null); setError(e instanceof Error ? e.message : 'Không thể kiểm tra quyền truy cập.'); } }
    };
    void check();
    window.addEventListener('focus', check); window.addEventListener('auth-change', check);
    return () => { active = false; window.removeEventListener('focus', check); window.removeEventListener('auth-change', check); };
  }, [pathname]);
  const allowed = identity && (identity.isManager || pathname.startsWith('/admin/workforce') || (identity.canChat && pathname.startsWith('/admin/chats')));
  useEffect(() => { if (identity && !allowed) router.replace('/admin/workforce'); }, [identity, allowed, router]);
  if (error) return <div className="fixed inset-0 z-[9999] grid place-items-center bg-slate-950 p-6 text-white">
    <div className="max-w-md space-y-5 rounded-3xl bg-slate-900 p-8 text-center"><ShieldAlert className="mx-auto text-rose-400" size={42} />
      <h1 className="text-xl font-bold">Không thể truy cập</h1><p className="text-sm text-slate-300">{error}</p>
      <div className="flex justify-center gap-5"><Link href="/">Trang chủ</Link><Link href="/admin/login" className="text-blue-300">Đăng nhập</Link></div>
    </div></div>;
  if (!identity || !allowed) return <div className="fixed inset-0 z-[9999] grid place-items-center bg-slate-950 text-white"><div className="flex items-center gap-3"><Loader2 className="animate-spin" />Đang kiểm tra quyền truy cập…</div></div>;
  return <WorkforceIdentity.Provider value={identity}>{children}</WorkforceIdentity.Provider>;
}
