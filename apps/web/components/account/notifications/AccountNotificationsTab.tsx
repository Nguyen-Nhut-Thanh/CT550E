"use client";

import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  Sparkles,
  Tag,
  Ticket,
  Users,
  XCircle,
} from "lucide-react";
import { AccountPageBanner } from "@/components/account/layout/AccountPageBanner";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccountResource } from "@/lib/account/useAccountResource";
import {
  getMembership,
  markMembershipNotificationsRead,
} from "@/lib/membership/api";

type NotificationFilter = "all" | "trips" | "vouchers" | "unread";

function getNotificationMeta(item: {
  title: string;
  booking_id?: number | null;
  voucher_id?: number | null;
}) {
  const t = item.title.toLowerCase();

  if (t.includes("hết hạn") || t.includes("hủy")) {
    return {
      icon: XCircle,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-100",
      borderColor: "border-rose-200",
      activeBg: "bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30",
      badgeText: "Hủy tour",
      badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    };
  }

  if (t.includes("thanh toán thành công")) {
    return {
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      borderColor: "border-emerald-200",
      activeBg: "bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30",
      badgeText: "Thanh toán",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
  }

  if (
    t.includes("đặt tour") ||
    t.includes("chờ thanh toán") ||
    t.includes("15 phút") ||
    t.includes("tiếp nhận")
  ) {
    return {
      icon: Clock,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
      borderColor: "border-amber-200",
      activeBg: "bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30",
      badgeText: "Đặt chỗ",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    };
  }

  if (item.voucher_id || t.includes("voucher") || t.includes("ưu đãi")) {
    return {
      icon: Tag,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      borderColor: "border-purple-200",
      activeBg: "bg-gradient-to-br from-purple-50/80 via-white to-purple-50/30",
      badgeText: "Ưu đãi",
      badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    };
  }

  if (t.includes("phụ trách") || t.includes("hướng dẫn")) {
    return {
      icon: Users,
      iconColor: "text-sky-600",
      iconBg: "bg-sky-100",
      borderColor: "border-sky-200",
      activeBg: "bg-gradient-to-br from-sky-50/80 via-white to-sky-50/30",
      badgeText: "Chuyến đi",
      badgeClass: "bg-sky-100 text-sky-800 border-sky-200",
    };
  }

  return {
    icon: Bell,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    borderColor: "border-blue-200",
    activeBg: "bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30",
    badgeText: "Hệ thống",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  };
}

export function AccountNotificationsTab() {
  const { data, loading, error, refresh, update } = useAccountResource(
    "membership",
    getMembership,
  );
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const notifications = useMemo(() => data?.notifications || [], [data]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read_at).length,
    [notifications],
  );

  const tripsCount = useMemo(
    () => notifications.filter((n) => n.booking_id != null).length,
    [notifications],
  );

  const vouchersCount = useMemo(
    () =>
      notifications.filter(
        (n) => n.voucher_id != null || n.title.toLowerCase().includes("voucher"),
      ).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case "trips":
        return notifications.filter((n) => n.booking_id != null);
      case "vouchers":
        return notifications.filter(
          (n) =>
            n.voucher_id != null || n.title.toLowerCase().includes("voucher"),
        );
      case "unread":
        return notifications.filter((n) => !n.read_at);
      default:
        return notifications;
    }
  }, [notifications, filter]);

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
    <div className="w-full min-w-0 space-y-6">
      <AccountPageBanner
        title={unreadCount > 0 ? `Thông báo (${unreadCount} chưa đọc)` : "Thông báo"}
        description="Cập nhật trạng thái đặt tour, hạn thanh toán, yêu cầu hủy và ưu đãi mới."
        icon={Bell}
        filterAriaLabel="Lọc thông báo"
        activeFilter={filter}
        onFilterChange={(value) => setFilter(value as typeof filter)}
        filters={[
          { value: "all", label: `Tất cả (${notifications.length})` },
          { value: "trips", label: `Chuyến đi & Đặt tour (${tripsCount})` },
          { value: "vouchers", label: `Ưu đãi & Voucher (${vouchersCount})` },
          { value: "unread", label: `Chưa đọc (${unreadCount})` },
        ]}
        controls={
          <>
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50"
            >
              Làm mới
            </button>
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={saving}
                onClick={() => void readAll()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
              >
                <CheckCheck size={15} />
                <span>Đánh dấu tất cả đã đọc</span>
              </button>
            )}
          </>
        }
      />

      {(error || actionError) && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700"
        >
          {error || actionError}
          <button
            type="button"
            onClick={refresh}
            className="ml-2 font-bold underline cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-sm font-semibold text-slate-600">
            Đang tải danh sách thông báo...
          </p>
        </div>
      ) : filteredNotifications.length ? (
        <ul className="space-y-3.5">
          {filteredNotifications.map((item) => {
            const meta = getNotificationMeta(item);
            const Icon = meta.icon;
            const isUnread = !item.read_at;

            return (
              <li
                key={item.notification_id}
                className={`group relative rounded-2xl border p-4 sm:p-5 transition shadow-2xs ${
                  isUnread
                    ? `${meta.borderColor} ${meta.activeBg}`
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3.5 sm:gap-4">
                  {/* Icon Loại thông báo */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${meta.iconBg} ${meta.iconColor}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Header thông báo: Tiêu đề + Tag phân loại + Mới */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold leading-none ${meta.badgeClass}`}
                        >
                          {meta.badgeText}
                        </span>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h2>
                      </div>

                      {isUnread && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10.5px] font-black uppercase text-white shadow-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          Mới
                        </span>
                      )}
                    </div>

                    {/* Nội dung thông báo */}
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                      {item.message}
                    </p>

                    {/* Footer: Thời gian + Nút xem chi tiết */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100/80">
                      <span className="text-[11px] font-medium text-slate-400">
                        {new Date(item.created_at).toLocaleString("vi-VN", {
                          timeZone: "Asia/Ho_Chi_Minh",
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>

                      {item.booking_id ? (
                        <Link
                          href={`/booking/${item.booking_id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
                        >
                          <span>Xem chi tiết booking #{item.booking_id}</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      ) : item.voucher_id ? (
                        <Link
                          href="/account/wallet"
                          className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline"
                        >
                          <span>Xem ví voucher & ưu đãi</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <Link
                          href="/account/membership"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
                        >
                          <span>Xem quyền lợi thành viên</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        !error && (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-2xs">
            <Inbox className="mx-auto mb-3 text-slate-300" size={42} />
            <p className="text-sm font-bold text-slate-800">
              {filter === "unread"
                ? "Bạn không có thông báo nào chưa đọc"
                : filter === "trips"
                ? "Chưa có thông báo nào về các chuyến đi"
                : filter === "vouchers"
                ? "Chưa có thông báo nào về voucher hoặc ưu đãi"
                : "Bạn chưa có thông báo nào"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Khi bạn đặt tour, thanh toán hoặc có cập nhật về chuyến đi, các thông báo sẽ xuất hiện ở đây.
            </p>
          </div>
        )
      )}
    </div>
  );
}
