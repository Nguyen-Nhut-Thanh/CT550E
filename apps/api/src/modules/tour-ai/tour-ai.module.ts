import { Module } from "@nestjs/common";
import { TourAiController } from "./tour-ai.controller";
import { TourCompareService } from "./tour-compare.service";
import { TourRecommendationsService } from "./tour-recommendations.service";

@Module({
  controllers: [TourAiController],
  providers: [TourCompareService, TourRecommendationsService],
  exports: [TourCompareService, TourRecommendationsService],
})
export class TourAiModule {}

