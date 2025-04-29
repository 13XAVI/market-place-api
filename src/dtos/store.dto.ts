import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateStoreDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsArray({ message: 'Product IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each product ID must be a valid UUID' })
  productIds?: string[];
}

export class UpdateStoreDto {
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @IsArray({ message: 'Product IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each product ID must be a valid UUID' })
  productIds?: string[];
}
