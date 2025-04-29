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
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;

  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

export class CreateOrderDto {
  @IsArray({ message: 'Items must be an array' })
  @IsNotEmpty({ message: 'At least one item is required' })
  items: OrderItemDto[];
}

export class UpdateOrderStatusDto {
  @IsString({ message: '' })
  @IsNotEmpty({ message: 'Status is required' })
  @IsIn(
    [
      ORDER_STATUS.CANCELLED,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PENDING,
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.DELIVERED,
    ],
    {
      message: 'Invalid status',
    },
  )
  status: string;
}
