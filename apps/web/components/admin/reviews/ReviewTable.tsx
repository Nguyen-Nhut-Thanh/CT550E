"use client";

import {
  CheckCircle,
  Eye,
  Headphones,
  ImageIcon,
  MessageSquare,
  Star,
  ThumbsDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { AdminReviewItem } from "shared";
import { AdminRowActions } from "@/components/admin/common/AdminRowActions";

interface ReviewTableProps {
  items: AdminReviewItem[];
  loading: boolean;
  onApprove: (reviewId: number) => Promise<void>;
  onOpenReject: (review: AdminReviewItem) => void;
  onOpenReply: (review: AdminReviewItem) => void;
  onViewDetail: (review: AdminReviewItem) => void;
  onContactCustomer: (review: AdminReviewItem) => void;
}

export function ReviewTable({
  items,
  loading,
  onApprove,
  onOpenReject,
  onOpenReply,
  onViewDetail,
  onContactCustomer,
}: ReviewTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="mt-3 text-xs font-semibold text-slate-500">Đang tải danh sách đánh giá...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
          <Star size={26} />
        </div>
        <h3 className="mt-3 text-sm font-bold text-slate-800">Không tìm thấy đánh giá nào</h3>
        <p className="mt-1 text-xs text-slate-500">
          Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
        </p>
      </div>
    );
  }

  const renderStatus = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Đã duyệt
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Đã ẩn / Từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Chờ duyệt
          </span>
        );
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500">
            <tr>
              <th className="py-3.5 pl-5 pr-3 font-semibold">Khách hàng</th>
              <th className="px-3 py-3.5 font-semibold">Tour & Đơn đặt</th>
              <th className="px-3 py-3.5 font-semibold">Nội dung đánh giá</th>
              <th className="px-3 py-3.5 font-semibold text-center">Trạng thái</th>
              <th className="px-3 py-3.5 font-semibold">Thời gian</th>
              <th className="py-3.5 pl-3 pr-5 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {items.map((item, index) => {
              const displayName = item.user?.full_name || "Khách hàng";
              const avatar = item.user?.avatar_url;
              const hasImages = item.images && item.images.length > 0;

              return (
                <tr key={item.review_id} className={`transition-colors hover:bg-blue-50/70 ${index % 2 === 0 ? "bg-[#f7faff]" : "bg-white"}`}>
                  {/* Khách hàng */}
                  <td className="py-4 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                        {avatar ? (
                          <Image
                            src={avatar}
                            alt={displayName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-bold text-slate-500">
                            {displayName[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 max-w-[140px]">
                        <p className="truncate font-bold text-slate-900" title={displayName}>
                          {displayName}
                        </p>
                        <p className="text-[11px] text-slate-400">ID: #{item.user_id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Tour */}
                  <td className="px-3 py-4">
                    <div className="min-w-0 max-w-[200px]">
                      <Link
                        href={`/tours/${item.tour_id}`}
                        target="_blank"
                        className="truncate font-semibold text-blue-600 hover:underline block"
                        title={item.tour_name}
                      >
                        {item.tour_name}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-mono text-slate-500">{item.tour_code}</span>
                        {item.booking_id && (
                          <span>• Đơn #{item.booking_id}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Review rating & content */}
                  <td className="px-3 py-4">
                    <div className="max-w-[320px] space-y-1">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < item.rating
                                ? "fill-amber-400 text-amber-500"
                                : "fill-slate-100 text-slate-200"
                            }
                          />
                        ))}
                        <span className="ml-1 text-[11px] font-bold text-slate-700">
                          {item.rating}.0
                        </span>
                      </div>

                      {item.title && (
                        <p className="truncate font-bold text-slate-800" title={item.title}>
                          {item.title}
                        </p>
                      )}

                      <p
                        className="line-clamp-2 text-slate-600 leading-relaxed"
                        title={item.comment || ""}
                      >
                        {item.comment || <span className="italic text-slate-400">Không có lời bình</span>}
                      </p>

                      {hasImages && (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-blue-600">
                          <ImageIcon size={12} />
                          <span>{item.images.length} ảnh đính kèm</span>
                        </div>
                      )}

                      {item.replies && item.replies.length > 0 && (
                        <div className="mt-1 inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                          <MessageSquare size={10} />
                          <span>Đã trả lời ({item.replies.length})</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-4 text-center whitespace-nowrap">
                    {renderStatus(item.status)}
                    {item.admin_note && (
                      <p className="mt-1 max-w-[120px] truncate text-[10px] text-rose-500 font-medium" title={item.admin_note}>
                        Lý do: {item.admin_note}
                      </p>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-3 py-4 text-slate-500 whitespace-nowrap">
                    <p className="font-medium text-slate-700">
                      {new Date(item.created_at).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(item.created_at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="py-4 pl-3 pr-5 text-right whitespace-nowrap">
                    <AdminRowActions
                      label={`Thao tác với đánh giá #${item.review_id}`}
                      orientation="horizontal"
                      actions={[
                        {
                          label: item.rating <= 3 ? "Chat xử lý đánh giá thấp" : "Liên hệ khách hàng",
                          icon: <Headphones size={16} className={item.rating <= 3 ? "text-amber-600" : ""} />,
                          onClick: () => onContactCustomer(item),
                          access: "view",
                        },
                        { label: "Xem chi tiết đánh giá", icon: <Eye size={16} />, onClick: () => onViewDetail(item), access: "view" },
                        { label: "Phản hồi đánh giá", icon: <MessageSquare size={16} />, onClick: () => onOpenReply(item), access: "manage" },
                        ...(item.status !== 1 ? [{ label: "Duyệt đánh giá", icon: <CheckCircle size={16} />, onClick: () => void onApprove(item.review_id), access: "manage" as const }] : []),
                        ...(item.status !== 2 ? [{ label: "Từ chối đánh giá", icon: <ThumbsDown size={16} />, onClick: () => onOpenReject(item), danger: true, access: "manage" as const }] : []),
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

