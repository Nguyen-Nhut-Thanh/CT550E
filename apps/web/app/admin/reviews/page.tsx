"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/common/admin_shared/layout/AdminPageHeader";
import { ReviewDetailModal } from "@/components/reviews/admin_reviews/AdminReviewDetailModal";
import {
  ReviewFilterTabs,
  type ReviewStatusFilter,
} from "@/components/reviews/admin_reviews/AdminReviewFilterTabs";
import { ReviewRejectModal } from "@/components/reviews/admin_reviews/AdminReviewRejectModal";
import { ReviewReplyModal } from "@/components/reviews/admin_reviews/AdminReviewReplyModal";
import { ReviewStatsCards } from "@/components/reviews/admin_reviews/AdminReviewStatsCards";
import { ReviewTable } from "@/components/reviews/admin_reviews/AdminReviewTable";
import {
  getAdminReviews,
  replyAdminReview,
  updateAdminReviewStatus,
} from "@/lib/reviews/admin/api";
import { chatApi } from "@/lib/chat/api";
import { useToast } from "@/lib/notifications/useToast";
import { RefreshCw, Star } from "lucide-react";
import type { AdminReviewItem } from "shared";

export default function AdminReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="text-sm font-semibold text-slate-500">
            Đang tải dữ liệu kiểm duyệt đánh giá...
          </div>
        </div>
      }
    >
      <AdminReviewsContent />
    </Suspense>
  );
}

function AdminReviewsContent() {
  const router = useRouter();
  const toast = useToast();
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [activeStatus, setActiveStatus] = useState<ReviewStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [selectedDetailReview, setSelectedDetailReview] = useState<AdminReviewItem | null>(null);
  const [rejectingReview, setRejectingReview] = useState<AdminReviewItem | null>(null);
  const [replyingReview, setReplyingReview] = useState<AdminReviewItem | null>(null);

  // Fetch reviews
  const loadReviews = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminReviews({ take: 100 });
      setReviews(res?.items || []);
      setTotalCount(res?.total || res?.items?.length || 0);
      if (isRefresh) {
        toast.success("Đã làm mới danh sách đánh giá.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  // Handle Quick Approve
  const handleApprove = async (reviewId: number) => {
    try {
      await updateAdminReviewStatus(reviewId, { status: 1 });
      toast.success(`Đã phê duyệt đánh giá #${reviewId} thành công!`);
      // Update local state
      setReviews((prev) =>
        prev.map((r) =>
          r.review_id === reviewId
            ? { ...r, status: 1, admin_note: null }
            : r
        )
      );
      if (selectedDetailReview?.review_id === reviewId) {
        setSelectedDetailReview((prev) =>
          prev ? { ...prev, status: 1, admin_note: null } : null
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi phê duyệt đánh giá.");
    }
  };

  // Handle Reject
  const handleConfirmReject = async (reviewId: number, adminNote: string) => {
    try {
      await updateAdminReviewStatus(reviewId, { status: 2, admin_note: adminNote });
      toast.success(`Đã từ chối / ẩn đánh giá #${reviewId}.`);
      setReviews((prev) =>
        prev.map((r) =>
          r.review_id === reviewId
            ? { ...r, status: 2, admin_note: adminNote }
            : r
        )
      );
      if (selectedDetailReview?.review_id === reviewId) {
        setSelectedDetailReview((prev) =>
          prev ? { ...prev, status: 2, admin_note: adminNote } : null
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi từ chối đánh giá.");
    }
  };

  // Handle Reply
  const handleConfirmReply = async (reviewId: number, content: string) => {
    try {
      const newReply = await replyAdminReview(reviewId, content);
      toast.success("Đã gửi phản hồi đánh giá thành công!");
      // Update local review replies
      setReviews((prev) =>
        prev.map((r) => {
          if (r.review_id === reviewId) {
            const replies = r.replies || [];
            return {
              ...r,
              replies: [...replies, newReply],
            };
          }
          return r;
        })
      );
      if (selectedDetailReview?.review_id === reviewId) {
        setSelectedDetailReview((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            replies: [...(prev.replies || []), newReply],
          };
        });
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi gửi phản hồi đánh giá.");
    }
  };

  // Handle Contact Customer via Chat
  const handleContactCustomer = async (review: AdminReviewItem) => {
    try {
      toast.info("Đang mở cuộc hội thoại chat với khách hàng...");
      const conversation = await chatApi.openWithUser(review.user_id);
      const customerName = review.user?.full_name || "anh/chị";
      const reviewDate = new Date(review.created_at).toLocaleDateString("vi-VN");

      const template = `Chào ${customerName}, em là đại diện từ bộ phận Chăm sóc khách hàng JourniTrip.\n\nEm liên hệ với mình về tour "${review.tour_name}" mà anh/chị đã tham gia và đánh giá ${review.rating} sao vào ngày ${reviewDate}.\n\nEm rất tiếc vì chuyến đi vừa qua chưa mang lại trải nghiệm trọn vẹn nhất cho anh/chị. Em xin phép được lắng nghe chi tiết hơn các vấn đề mình đã gặp phải trong chuyến đi để hỗ trợ và xử lý giúp anh/chị ạ.\n\n👉 Anh/chị có thể bấm vào nút "Chỉnh sửa đánh giá" ở thẻ đánh giá bên trên để xem lại hoặc cập nhật nội dung đánh giá trực tiếp nhé!`;

      const params = new URLSearchParams({
        conversationId: String(conversation.conversation_id),
        initialText: template,
        reviewId: String(review.review_id),
        tourName: review.tour_name,
        rating: String(review.rating),
      });

      router.push(`/admin/chats?${params.toString()}`);
    } catch (err: any) {
      toast.error(err?.message || "Không thể mở chat với khách hàng này.");
    }
  };

  // Stats calculation
  const pendingCount = useMemo(() => reviews.filter((r) => r.status === 0).length, [reviews]);
  const approvedCount = useMemo(() => reviews.filter((r) => r.status === 1).length, [reviews]);
  const rejectedCount = useMemo(() => reviews.filter((r) => r.status === 2).length, [reviews]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let result = [...reviews];

    // Status filter
    if (activeStatus !== "all") {
      const targetStatus = Number(activeStatus);
      result = result.filter((r) => r.status === targetStatus);
    }

    // Rating filter
    if (ratingFilter !== "all") {
      result = result.filter((r) => r.rating === ratingFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          (r.user?.full_name && r.user.full_name.toLowerCase().includes(q)) ||
          (r.tour_name && r.tour_name.toLowerCase().includes(q)) ||
          (r.tour_code && r.tour_code.toLowerCase().includes(q)) ||
          (r.comment && r.comment.toLowerCase().includes(q)) ||
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.booking_id && String(r.booking_id).includes(q)) ||
          String(r.review_id).includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "highest") {
        return b.rating - a.rating;
      }
      if (sortBy === "lowest") {
        return a.rating - b.rating;
      }
      return 0;
    });

    return result;
  }, [reviews, activeStatus, ratingFilter, searchQuery, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, ratingFilter, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-3 font-sans text-sm">
      {/* Header */}
      <AdminPageHeader
        title="Quản lý & Duyệt đánh giá"
        description="Kiểm duyệt nội dung, quản lý trạng thái và phản hồi các đánh giá của khách hàng cho tour du lịch."
        actions={
          <button
            type="button"
            onClick={() => loadReviews(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin text-blue-600" : ""}
            />
            <span>Làm mới</span>
          </button>
        }
      />

      {/* KPI Stats */}
      <ReviewStatsCards items={reviews} total={totalCount} />

      {/* Filter Tabs & Search */}
      <ReviewFilterTabs
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
        totalCount={reviews.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        ratingFilter={ratingFilter}
        onRatingChange={setRatingFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Review List / Table */}
      <ReviewTable
        items={paginatedItems}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredItems.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onApprove={handleApprove}
        onOpenReject={setRejectingReview}
        onOpenReply={setReplyingReview}
        onViewDetail={setSelectedDetailReview}
        onContactCustomer={handleContactCustomer}
      />

      {/* Modal Reject */}
      <ReviewRejectModal
        review={rejectingReview}
        isOpen={Boolean(rejectingReview)}
        onClose={() => setRejectingReview(null)}
        onConfirm={handleConfirmReject}
      />

      {/* Modal Reply */}
      <ReviewReplyModal
        review={replyingReview}
        isOpen={Boolean(replyingReview)}
        onClose={() => setReplyingReview(null)}
        onConfirm={handleConfirmReply}
      />

      {/* Modal Detail */}
      <ReviewDetailModal
        review={selectedDetailReview}
        isOpen={Boolean(selectedDetailReview)}
        onClose={() => setSelectedDetailReview(null)}
        onApprove={handleApprove}
        onContactCustomer={handleContactCustomer}
        onOpenReject={(r) => {
          setSelectedDetailReview(null);
          setRejectingReview(r);
        }}
        onOpenReply={(r) => {
          setSelectedDetailReview(null);
          setReplyingReview(r);
        }}
      />
    </div>
  );
}

