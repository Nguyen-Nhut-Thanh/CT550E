import { Body, Controller, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import type { AuthenticatedUser } from "../../common/auth/authenticated-request";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt.guard";
import { TourCompareDto } from "./dto/tour-compare.dto";
import { TourRecommendationsDto } from "./dto/tour-recommendations.dto";
import { TourCompareService } from "./tour-compare.service";
import { TourRecommendationsService } from "./tour-recommendations.service";

@Controller("ai")
export class TourAiController {
  constructor(
    private readonly compareService: TourCompareService,
    private readonly recommendationsService: TourRecommendationsService,
  ) {}

  @Post("compare-tours")
  @HttpCode(200)
  async compareTours(@Body() body: TourCompareDto) {
    return this.compareService.compare(body.tourIds);
  }

  @Post("recommendations")
  @HttpCode(200)
  @UseGuards(OptionalJwtAuthGuard)
  async getRecommendations(
    @Body() body: TourRecommendationsDto,
    @Req() request: Request & { user?: AuthenticatedUser },
  ) {
    return this.recommendationsService.getRecommendations(body, request.user?.accountId);
  }
}
