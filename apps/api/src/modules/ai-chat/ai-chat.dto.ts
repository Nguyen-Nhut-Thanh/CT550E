import { Type } from "class-transformer";
import {
  ArrayMaxSize, IsArray, IsIn, IsInt, IsObject, IsOptional, IsString,
  Max, MaxLength, Min, ValidateNested,
} from "class-validator";
import type { AiChatRequest } from "shared";

const positiveId = 2_147_483_647;

class TourReferenceDto {
  @IsInt()
  @Min(1)
  @Max(positiveId)
  tourId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(positiveId)
  scheduleId?: number;
}

export class AiChatDto implements AiChatRequest {
  @IsString()
  @MaxLength(1000)
  message!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  previousQuestions?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TourReferenceDto)
  tourReference?: TourReferenceDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => TourReferenceDto)
  recentTours?: TourReferenceDto[];

  @IsOptional()
  @IsIn(["advice", "quote", "offers"])
  action?: AiChatRequest["action"];
}

