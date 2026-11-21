import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt } from "class-validator";

export class TourCompareDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @IsInt({ each: true })
  tourIds!: number[];
}

