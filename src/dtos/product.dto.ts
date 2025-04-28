import { IsString, IsNotEmpty, IsNumber, IsPositive, IsUUID, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class ProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsArray({ message: 'Images must be an array' })
  @IsString({ each: true, message: 'Each image must be a string' })
  @IsNotEmpty({ message: 'At least one image is required' })
  image: string[];

  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be positive' })
  price: number;

  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @IsUUID('4', { message: 'Store ID must be a valid UUID' })
  @IsOptional()
  storeId?: string;

  @IsBoolean({ message: 'isFeatured must be a boolean' })
  @IsOptional()
  isFeatured?: boolean;
}