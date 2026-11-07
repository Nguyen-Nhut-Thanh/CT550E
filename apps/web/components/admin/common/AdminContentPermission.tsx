"use client";

import { LockKeyhole } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ADMIN_CONTENT_DENIED } from 'shared';
import { useWorkforceIdentity } from '@/components/admin/layout/AdminGuard';

export function useAdminContentReadOnly() {
  const actor = useWorkforceIdentity();
  const path = usePathname();
  const workforce = path === '/admin/workforce' || path.startsWith('/admin/workforce/');
  const chat = path === '/admin/chats' || path.startsWith('/admin/chats/');
  return Boolean(actor && !actor.isAdmin && !workforce && !chat);
}

export function AdminPermissionNotice({ className = '' }: { className?: string }) {
  return <p role="note" className={`flex items-start gap-2 rounded-xl border border-red-300 bg-white px-4 py-3 text-xs leading-5 text-red-600 ${className}`}><LockKeyhole size={15} className="mt-0.5 shrink-0" />{ADMIN_CONTENT_DENIED}</p>;
}

export function AdminContentPermission() {
  const readOnly = useAdminContentReadOnly();
  return readOnly ? <AdminPermissionNotice className="mb-3" /> : null;
}
