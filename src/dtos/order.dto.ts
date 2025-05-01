import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
  IsString,
  IsIn,
} from 'class-validator';
import { ORDER_STATUS } from 'src/utils/enum';

export class OrderItemDto {
  @ApiProperty({
    description: 'Unique identifier of the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product in the order',
    example: 2,
    minimum: 1,
  })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'List of items in the order',
    type: [OrderItemDto],
    example: [
      { productId: '123e4567-e89b-12d3-a456-426614174000', quantity: 2 },
      { productId: '987e6543-e21b-12d3-a456-426614174000', quantity: 1 },
    ],
  })
  @IsArray({ message: 'Items must be an array' })
  @IsNotEmpty({ message: 'At least one item is required' })
  items: OrderItemDto[];
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Order status',
    enum: [
      ORDER_STATUS.CANCELLED,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PENDING,
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.DELIVERED,
    ],
    example: ORDER_STATUS.PENDING,
  })
  @IsString()
  @IsNotEmpty({ message: 'Status is required' })
  @IsIn(
    [
      ORDER_STATUS.CANCELLED,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PENDING,
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.DELIVERED,
    ],
    { message: 'Invalid status' },
  )
  status: string;
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the order',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'List of items in the order',
    type: [OrderItemDto],
    example: [
      { productId: '123e4567-e89b-12d3-a456-426614174000', quantity: 2 },
      { productId: '987e6543-e21b-12d3-a456-426614174000', quantity: 1 },
    ],
  })
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Current status of the order',
    enum: [
      ORDER_STATUS.CANCELLED,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PENDING,
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.DELIVERED,
    ],
    example: ORDER_STATUS.PENDING,
  })
  status: string;

  @ApiProperty({
    description: 'Total price of the order',
    example: 99.99,
  })
  total: number;
}
