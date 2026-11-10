import { BadRequestException, Body, Controller, Get, InternalServerErrorException, Param, ParseIntPipe, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { CreateReplyPayload, CreateReviewPayload } from "shared";
import { CloudinaryService } from "../../infrastructure/storage/cloudinary.service";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { ReviewsService } from "./reviews.service";
@Controller()
export class ReviewsController {
    constructor(
        private readonly reviewsService: ReviewsService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }
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
    @UseGuards(JwtAuthGuard)
    @Post("reviews/upload-image")
    @UseInterceptors(FileInterceptor("file"))
    async uploadReviewImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException("Không tìm thấy file để upload");
        }
        try {
            const result = await this.cloudinaryService.uploadBuffer(file.buffer, {
                folder: "JourniTrip/reviews",
                resource_type: "image",
            });
            return { url: result.secure_url };
        } catch (error: any) {
            throw new InternalServerErrorException(`Lỗi upload ảnh đánh giá: ${error?.message || "Lỗi không xác định"}`);
        }
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
