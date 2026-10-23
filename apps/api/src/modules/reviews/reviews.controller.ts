import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { CreateReplyPayload, CreateReviewPayload } from "shared";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { ReviewsService } from "./reviews.service";
@Controller()
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }
    @UseGuards(JwtAuthGuard)
    @Get("account/reviews")
    getMyReviews(
    @Req()
    req: any) {
        return this.reviewsService.getMyReviews(req.user.accountId);
    }
    @UseGuards(JwtAuthGuard)
    @Patch("account/reviews/:reviewId")
    updateMyReview(
    @Req()
    req: any,
    @Param("reviewId", ParseIntPipe)
    reviewId: number,
    @Body()
    dto: {
        rating: number;
        comment: string;
    }) {
        return this.reviewsService.updateMyReview(req.user.accountId, reviewId, dto);
    }
    // 1. Lấy danh sách đánh giá công khai (Đã duyệt) của 1 Tour
    @Get("tours/:tourId/reviews")
    async getTourReviews(
    @Param("tourId", ParseIntPipe)
    tourId: number,
    @Req()
    req: any) {
        // Nếu có token người dùng, lấy accountId để kiểm tra is_liked
        const accountId = req?.user?.accountId;
        return this.reviewsService.getTourReviews(tourId, accountId);
    }
    // 2. Khách hàng gửi đánh giá mới (Mặc định status = 0: Chờ Admin duyệt)
    @UseGuards(JwtAuthGuard)
    @Post("tours/:tourId/reviews")
    async createReview(
    @Param("tourId", ParseIntPipe)
    tourId: number,
    @Req()
    req: any,
    @Body()
    dto: CreateReviewPayload) {
        const accountId = req.user.accountId;
        return this.reviewsService.createReview(accountId, tourId, dto);
    }
    // 3. Thích / Bỏ thích 1 đánh giá
    @UseGuards(JwtAuthGuard)
    @Post("reviews/:reviewId/like")
    async toggleLikeReview(
    @Param("reviewId", ParseIntPipe)
    reviewId: number,
    @Req()
    req: any) {
        const accountId = req.user.accountId;
        return this.reviewsService.toggleLikeReview(accountId, reviewId);
    }
    // 4. Trả lời / Phản hồi 1 đánh giá
    @UseGuards(JwtAuthGuard)
    @Post("reviews/:reviewId/reply")
    async createReply(
    @Param("reviewId", ParseIntPipe)
    reviewId: number,
    @Req()
    req: any,
    @Body()
    dto: CreateReplyPayload) {
        const accountId = req.user.accountId;
        return this.reviewsService.createReply(accountId, reviewId, dto);
    }
}
