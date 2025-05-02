import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewDto {
  @ApiProperty({
    example: 4,
    minimum: 1,
    maximum: 5,
    description: 'Rating between 1 and 5',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    example: 'Great product!',
    description: 'Optional review comment',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    example: 'abc123',
    description: 'ID of the product being reviewed',
  })
  @IsString()
  productId: string;
}

export class UpdateReviewDto {
  @ApiPropertyOptional({
    example: 5,
    minimum: 1,
    maximum: 5,
    description: 'Updated rating',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    example: 'Even better than before!',
    description: 'Updated comment',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
