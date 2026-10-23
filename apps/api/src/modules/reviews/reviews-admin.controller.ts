import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from "@nestjs/common";
import type { AdminReviewQuery, AdminUpdateReviewStatusPayload } from "shared";
import { AdminAuthGuard } from "../auth/admin.guard";
import { ReviewsService } from "./reviews.service";
@Controller()
@UseGuards(AdminAuthGuard)
export class ReviewsAdminController {
    constructor(private readonly reviewsService: ReviewsService) { }
    // ================= ADMIN CONTROLLER =================
    // 5. Admin lấy danh sách tất cả đánh giá (có lọc theo status 0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối)
    @Get("admin/reviews")
    async adminGetReviews(
    @Query()
    query: AdminReviewQuery) {
        return this.reviewsService.adminGetReviews(query);
    }
    // 6. Admin phê duyệt hoặc từ chối đánh giá
    @Patch("admin/reviews/:reviewId/status")
    async adminUpdateReviewStatus(
    @Param("reviewId", ParseIntPipe)
    reviewId: number,
    @Body()
    dto: AdminUpdateReviewStatusPayload) {
        return this.reviewsService.adminUpdateReviewStatus(reviewId, dto);
    }
}
