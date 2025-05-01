import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsPositive,
  IsUUID,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class ProductDto {
  @ApiProperty({
    description: 'Name of the product',
    example: 'Smartphone',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'Array of image URLs for the product',
    example: [
      'https://example.com/images/phone1.jpg',
      'https://example.com/images/phone2.jpg',
    ],
    type: [String],
  })
  @IsArray({ message: 'Images must be an array' })
  @IsString({ each: true, message: 'Each image must be a string' })
  @IsNotEmpty({ message: 'At least one image is required' })
  image: string[];

  @ApiProperty({
    description: 'Price of the product',
    example: 499.99,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be positive' })
  price: number;

  @ApiProperty({
    description: 'Unique identifier of the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @ApiProperty({
    description: 'Unique identifier of the store (optional)',
    example: '987e6543-e21b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID('4', { message: 'Store ID must be a valid UUID' })
  @IsOptional()
  storeId?: string;

  @ApiProperty({
    description: 'Whether the product is featured (optional)',
    example: true,
    required: false,
  })
  @IsBoolean({ message: 'isFeatured must be a boolean' })
  @IsOptional()
  isFeatured?: boolean;
}

export class ProductResponseDto extends ProductDto {
  @ApiProperty({
    description: 'Unique identifier of the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;
}
