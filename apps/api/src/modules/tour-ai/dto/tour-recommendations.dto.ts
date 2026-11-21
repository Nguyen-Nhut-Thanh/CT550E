import { Type } from "class-transformer";
import {
  ArrayMaxSize, IsArray, IsDateString, IsIn, IsInt, IsNumber, IsObject,
  IsOptional, IsString, Max, MaxLength, Min, Validate, ValidateNested,
  ValidatorConstraint, type ValidatorConstraintInterface,
} from "class-validator";
import type { UserBehaviorSignals } from "shared";

class TourViewDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  tourId!: number;

  @IsDateString()
  viewedAt!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;
}

class PriceRangeDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  max?: number;
}

@ValidatorConstraint({ name: "orderedPriceRange", async: false })
class OrderedPriceRange implements ValidatorConstraintInterface {
  validate(range?: PriceRangeDto) {
    return !range || range.min == null || range.max == null || range.min <= range.max;
  }

  defaultMessage() {
    return "price_range.max must be greater than or equal to price_range.min";
  }
}

class RecommendationFiltersDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PriceRangeDto)
  @Validate(OrderedPriceRange)
  price_range?: PriceRangeDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  departure_location_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  destination?: string;

  @IsOptional()
  @IsIn(["domestic", "outbound", "international"])
  tour_type?: string;
}

export class TourRecommendationsDto implements Partial<UserBehaviorSignals> {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => TourViewDto)
  viewed_tours?: TourViewDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  searched_keywords?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => RecommendationFiltersDto)
  applied_filters?: RecommendationFiltersDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(2147483647, { each: true })
  wishlist_tour_ids?: number[];
}

