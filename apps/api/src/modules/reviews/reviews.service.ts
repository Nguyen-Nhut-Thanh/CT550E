import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import type {
  AdminReviewQuery,
  AdminUpdateReviewStatusPayload,
  CreateReplyPayload,
  CreateReviewPayload,
} from "shared";

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUserIdFromAccountId(accountId: number): Promise<number> {
    const user = await this.prisma.users.findUnique({
      where: { account_id: accountId },
      select: { user_id: true },
    });
    if (!user) {
      throw new NotFoundException("Không tìm thấy thông tin tài khoản người dùng.");
    }
    return user.user_id;
  }

  /**
   * Tự động tính lại rating_avg và rating_count trên Tour gốc sau khi Admin duyệt / ẩn review
   */
  async recalculateTourRating(tourId: number): Promise<void> {
    const aggregate = await this.prisma.reviews.aggregate({
      where: {
        tour_id: tourId,
        status: 1, // Chỉ tính các review đã được duyệt
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const ratingAvg = aggregate._avg.rating
      ? Number(aggregate._avg.rating.toFixed(2))
      : 0;
    const ratingCount = aggregate._count.rating || 0;

    await this.prisma.tours.update({
      where: { tour_id: tourId },
      data: {
        rating_avg: ratingAvg,
        rating_count: ratingCount,
      },
    });
  }

  /**
   * Lấy danh sách đánh giá đã duyệt của 1 tour cho người dùng xem
   */
  async getTourReviews(tourId: number, currentAccountId?: number) {
    let currentUserId: number | null = null;
    if (currentAccountId) {
      const u = await this.prisma.users.findUnique({
        where: { account_id: currentAccountId },
        select: { user_id: true },
      });
      if (u) currentUserId = u.user_id;
    }

    const reviews = await this.prisma.reviews.findMany({
      where: {
        tour_id: tourId,
        status: 1, // Chỉ hiển thị đánh giá đã duyệt
      },
      orderBy: { created_at: "desc" },
      include: {
        users: {
          select: {
            user_id: true,
            full_name: true,
            avatar_url: true,
          },
        },
        review_replies: {
          where: { status: 1 },
          orderBy: { created_at: "asc" },
          include: {
            users: {
              select: {
                user_id: true,
                full_name: true,
                avatar_url: true,
              },
            },
          },
        },
        review_likes: currentUserId
          ? {
              where: { user_id: currentUserId },
              select: { user_id: true },
            }
          : false,
      },
    });

    return reviews.map((r: any) => ({
      review_id: r.review_id,
      user_id: r.user_id,
      tour_id: r.tour_id,
      booking_id: r.booking_id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      images: Array.isArray(r.images) ? r.images : r.images ? [String(r.images)] : [],
      likes_count: r.likes_count,
      is_liked: currentUserId ? (r.review_likes as any[])?.length > 0 : false,
      status: r.status,
      created_at: r.created_at.toISOString(),
      user: {
        user_id: r.users.user_id,
        full_name: r.users.full_name,
        avatar_url: r.users.avatar_url,
      },
      replies: r.review_replies.map((reply: any) => ({
        reply_id: reply.reply_id,
        review_id: reply.review_id,
        user_id: reply.user_id,
        content: reply.content,
        status: reply.status,
        created_at: reply.created_at.toISOString(),
        user: {
          user_id: reply.users.user_id,
          full_name: reply.users.full_name,
          avatar_url: reply.users.avatar_url,
        },
      })),
    }));
  }

  /**
   * Người dùng gửi đánh giá mới (Mặc định status = 0: Chờ Admin duyệt)
   */
  async createReview(accountId: number, tourId: number, dto: CreateReviewPayload) {
    const userId = await this.getUserIdFromAccountId(accountId);

    // Kiểm tra tour có tồn tại không
    const tour = await this.prisma.tours.findUnique({
      where: { tour_id: tourId },
    });
    if (!tour) {
      throw new NotFoundException("Tour không tồn tại.");
    }

    if (dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException("Số sao đánh giá phải từ 1 đến 5.");
    }

    const review = await this.prisma.reviews.create({
      data: {
        user_id: userId,
        tour_id: tourId,
        booking_id: dto.booking_id || null,
        rating: Math.min(5, Math.max(1, dto.rating)),
        title: dto.title || null,
        comment: dto.comment || null,
        images: dto.images && dto.images.length > 0 ? dto.images : null,
        status: 0, // Chờ Admin duyệt
      },
      include: {
        users: {
          select: {
            user_id: true,
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });

    return {
      message:
        "Đánh giá của bạn đã được gửi thành công và đang chờ Quản trị viên duyệt!",
      review: {
        review_id: review.review_id,
        status: review.status,
      },
    };
  }

  /**
   * Thích / Bỏ thích 1 đánh giá
   */
  async toggleLikeReview(accountId: number, reviewId: number) {
    const userId = await this.getUserIdFromAccountId(accountId);

    const review = await this.prisma.reviews.findUnique({
      where: { review_id: reviewId },
    });
    if (!review) {
      throw new NotFoundException("Đánh giá không tồn tại.");
    }

    const existingLike = await this.prisma.review_likes.findUnique({
      where: {
        review_id_user_id: {
          review_id: reviewId,
          user_id: userId,
        },
      },
    });

    let isLiked = false;

    if (existingLike) {
      await this.prisma.review_likes.delete({
        where: {
          review_id_user_id: {
            review_id: reviewId,
            user_id: userId,
          },
        },
      });
      await this.prisma.reviews.update({
        where: { review_id: reviewId },
        data: {
          likes_count: { decrement: 1 },
        },
      });
      isLiked = false;
    } else {
      await this.prisma.review_likes.create({
        data: {
          review_id: reviewId,
          user_id: userId,
        },
      });
      await this.prisma.reviews.update({
        where: { review_id: reviewId },
        data: {
          likes_count: { increment: 1 },
        },
      });
      isLiked = true;
    }

    const updated = await this.prisma.reviews.findUnique({
      where: { review_id: reviewId },
      select: { likes_count: true },
    });

    return {
      is_liked: isLiked,
      likes_count: updated?.likes_count ?? 0,
    };
  }

  /**
   * Thêm phản hồi / trả lời vào 1 đánh giá
   */
  async createReply(accountId: number, reviewId: number, dto: CreateReplyPayload) {
    const userId = await this.getUserIdFromAccountId(accountId);

    if (!dto.content || !dto.content.trim()) {
      throw new BadRequestException("Nội dung trả lời không được để trống.");
    }

    const review = await this.prisma.reviews.findUnique({
      where: { review_id: reviewId },
    });
    if (!review) {
      throw new NotFoundException("Đánh giá không tồn tại.");
    }

    const reply = await this.prisma.review_replies.create({
      data: {
        review_id: reviewId,
        user_id: userId,
        content: dto.content.trim(),
        status: 1,
      },
      include: {
        users: {
          select: {
            user_id: true,
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });

    return {
      reply_id: reply.reply_id,
      review_id: reply.review_id,
      user_id: reply.user_id,
      content: reply.content,
      status: reply.status,
      created_at: reply.created_at.toISOString(),
      user: {
        user_id: reply.users.user_id,
        full_name: reply.users.full_name,
        avatar_url: reply.users.avatar_url,
      },
    };
  }

  // ================= ADMIN FUNCTIONS =================

  /**
   * Admin xem danh sách đánh giá kèm lọc theo status (0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối)
   */
  async adminGetReviews(query: AdminReviewQuery) {
    const take = Math.min(Math.max(Number(query.take || 20), 1), 100);
    const skip = Math.max(Number(query.skip || 0), 0);

    const where: any = {};
    if (query.status !== undefined && query.status !== "") {
      where.status = Number(query.status);
    }
    if (query.tour_id) {
      where.tour_id = Number(query.tour_id);
    }

    const [items, total] = await Promise.all([
      this.prisma.reviews.findMany({
        where,
        take,
        skip,
        orderBy: { created_at: "desc" },
        include: {
          users: {
            select: {
              user_id: true,
              full_name: true,
              avatar_url: true,
            },
          },
          tours: {
            select: {
              tour_id: true,
              code: true,
              name: true,
            },
          },
          review_replies: {
            include: {
              users: {
                select: {
                  user_id: true,
                  full_name: true,
                  avatar_url: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.reviews.count({ where }),
    ]);

    return {
      items: items.map((r: any) => ({
        review_id: r.review_id,
        user_id: r.user_id,
        tour_id: r.tour_id,
        booking_id: r.booking_id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        images: Array.isArray(r.images) ? r.images : r.images ? [String(r.images)] : [],
        likes_count: r.likes_count,
        status: r.status,
        admin_note: r.admin_note,
        created_at: r.created_at.toISOString(),
        tour_name: r.tours.name,
        tour_code: r.tours.code,
        user: {
          user_id: r.users.user_id,
          full_name: r.users.full_name,
          avatar_url: r.users.avatar_url,
        },
        replies: r.review_replies.map((reply: any) => ({
          reply_id: reply.reply_id,
          review_id: reply.review_id,
          user_id: reply.user_id,
          content: reply.content,
          status: reply.status,
          created_at: reply.created_at.toISOString(),
          user: {
            user_id: reply.users.user_id,
            full_name: reply.users.full_name,
            avatar_url: reply.users.avatar_url,
          },
        })),
      })),
      total,
      take,
      skip,
    };
  }

  /**
   * Admin duyệt (status = 1) hoặc từ chối / ẩn (status = 2) đánh giá
   */
  async adminUpdateReviewStatus(
    reviewId: number,
    dto: AdminUpdateReviewStatusPayload,
  ) {
    const review = await this.prisma.reviews.findUnique({
      where: { review_id: reviewId },
    });
    if (!review) {
      throw new NotFoundException("Đánh giá không tồn tại.");
    }

    const updated = await this.prisma.reviews.update({
      where: { review_id: reviewId },
      data: {
        status: dto.status,
        admin_note: dto.admin_note || null,
      },
    });

    // Tự động tính toán lại rating_avg & rating_count cho Tour gốc!
    await this.recalculateTourRating(review.tour_id);

    return {
      message:
        dto.status === 1
          ? "Đã phê duyệt đánh giá thành công!"
          : "Đã từ chối / ẩn đánh giá!",
      review: {
        review_id: updated.review_id,
        status: updated.status,
      },
    };
  }
}
