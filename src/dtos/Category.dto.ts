import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Electronics',
  })
  @IsString({ message: 'Category name should be string' })
  @IsNotEmpty({ message: 'Category name is required' })
  name: string;

  @ApiProperty({
    description: 'Description of the category',
    example:
      'Devices and gadgets including smartphones, laptops, and accessories',
  })
  @IsString({ message: 'Description should be string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;
}

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the category',
    example: 'Electronics',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the category',
    example:
      'Devices and gadgets including smartphones, laptops, and accessories',
  })
  description: string;
}
