import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({
    description: 'Name of the store',
    example: 'Tech Store',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'Array of product IDs associated with the store (optional)',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987e6543-e21b-12d3-a456-426614174000',
    ],
    type: [String],
    required: false,
  })
  @IsArray({ message: 'Product IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each product ID must be a valid UUID' })
  @IsOptional()
  productIds?: string[];
}

export class UpdateStoreDto {
  @ApiProperty({
    description: 'Name of the store (optional)',
    example: 'Tech Store Updated',
    required: false,
  })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Array of product IDs associated with the store (optional)',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987e6543-e21b-12d3-a456-426614174000',
    ],
    type: [String],
    required: false,
  })
  @IsArray({ message: 'Product IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each product ID must be a valid UUID' })
  @IsOptional()
  productIds?: string[];
}

export class StoreResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the store',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the store',
    example: 'Tech Store',
  })
  name: string;

  @ApiProperty({
    description: 'Array of product IDs associated with the store',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987e6543-e21b-12d3-a456-426614174000',
    ],
    type: [String],
  })
  productIds: string[];
}
