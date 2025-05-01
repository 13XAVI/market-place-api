import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class ReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsString()
  productId: string;
}

export class UpdateReviewDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number;
  
    @IsOptional()
    @IsString()
    comment?: string;
  }