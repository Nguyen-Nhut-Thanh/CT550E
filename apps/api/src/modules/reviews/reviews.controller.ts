import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
} from "@nestjs/common";
import type { CreateReplyPayload, CreateReviewPayload } from "shared";
import type { AuthenticatedRequest } from "../../common/auth";
import { UseImageUpload } from "../../common/decorators/use-image-upload.decorator";
import { uploadToFolder } from "../../common/decorators/use-folder-upload";
import { CloudinaryService } from "../../infrastructure/storage/cloudinary.service";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt.guard";
import { ReviewsService } from "./reviews.service";

@Controller()
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get("account/reviews")
  async getMyReviews(@Req() req: AuthenticatedRequest) {
    return this.reviewsService.getMyReviews(req.user.accountId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("account/reviews/:reviewId")
  async updateMyReview(
    @Req() req: AuthenticatedRequest,
    @Param("reviewId", ParseIntPipe) reviewId: number,
    @Body() dto: { rating: number; comment: string },
  ) {
    return this.reviewsService.updateMyReview(req.user.accountId, reviewId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("reviews/upload-image")
  @UseImageUpload()
  async uploadReviewImage(@UploadedFile() file: Express.Multer.File) {
    return uploadToFolder(this.cloudinaryService, file, "JourniTrip/reviews");
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get("tours/:tourId/reviews")
  async getTourReviews(
    @Param("tourId", ParseIntPipe) tourId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const accountId = req?.user?.accountId;
    return this.reviewsService.getTourReviews(tourId, accountId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("tours/:tourId/reviews")
  async createReview(
    @Param("tourId", ParseIntPipe) tourId: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReviewPayload,
  ) {
    const accountId = req.user.accountId;
    return this.reviewsService.createReview(accountId, tourId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("reviews/:reviewId/like")
  async toggleLikeReview(
    @Param("reviewId", ParseIntPipe) reviewId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const accountId = req.user.accountId;
    return this.reviewsService.toggleLikeReview(accountId, reviewId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("reviews/:reviewId/reply")
  async createReply(
    @Param("reviewId", ParseIntPipe) reviewId: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReplyPayload,
  ) {
    const accountId = req.user.accountId;
    return this.reviewsService.createReply(accountId, reviewId, dto);
  }
}
