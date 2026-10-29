"use client";

import { Bell, CheckCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAccountResource } from "@/lib/account/useAccountResource";
import {
  getMembership,
  markMembershipNotificationsRead,
} from "@/lib/membership/api";

export function AccountNotificationsTab() {
  const { data, loading, error, refresh, update } = useAccountResource(
    "membership",
    getMembership,
  );
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  async function readAll() {
    setSaving(true);
    setActionError("");
    try {
      await markMembershipNotificationsRead();
      update((previous) => ({
        ...previous,
        notifications: previous.notifications.map((item) => ({
          ...item,
          read_at: item.read_at ?? new Date().toISOString(),
        })),
      }));
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : "Không thể đánh dấu đã đọc.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Thông báo</h1>
          <p className="mt-2 text-sm text-slate-500">
            Cập nhật hạng thành viên, voucher mới và nhắc ngày xét hạng.
          </p>
        </div>
        {data?.notifications.some((item) => !item.read_at) && (
          <button
            disabled={saving}
            onClick={() => void readAll()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 disabled:opacity-50"
          >
            <CheckCheck size={16} />
            Đánh dấu đã đọc
          </button>
        )}
      </header>
      {(error || actionError) && (
        <p role="alert" className="text-sm text-rose-600">
          {error || actionError}
          <button onClick={refresh} className="ml-3 underline">
            Thử lại
          </button>
        </p>
      )}
      {loading ? (
        <p role="status" className="flex items-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" />
          Đang tải thông báo...
        </p>
      ) : data?.notifications.length ? (
        <ul className="space-y-3">
          {data.notifications.map((item) => (
            <li
              key={item.notification_id}
              className={`rounded-2xl border p-5 ${item.read_at ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/70"}`}
            >
              <div className="flex items-start gap-3">
                <Bell size={20} className="mt-1 shrink-0 text-blue-600" />
                <div>
                  <h2 className="font-bold text-slate-900">
                    {item.title}
                    {!item.read_at && (
                      <span className="ml-2 text-xs text-blue-600">Mới</span>
                    )}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.message}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleString("vi-VN", {
                      timeZone: "Asia/Ho_Chi_Minh",
                    })}
                  </p>
                  <Link
                    href="/account/membership"
                    className="mt-3 inline-block text-xs font-bold text-blue-700"
                  >
                    Xem hạng & quyền lợi →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Bell className="mx-auto mb-3 text-sky-400" size={40} />
            <p className="text-sm font-bold text-slate-700">
              Bạn chưa có thông báo mới
            </p>
          </div>
        )
      )}
    </div>
  );
}
