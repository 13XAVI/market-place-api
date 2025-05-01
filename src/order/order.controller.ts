import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dtos';
import { ROLES } from '../utils/enum';
import { RoleGuard, Roles } from 'src/role';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/dtos/errorResponse.dto';

@Controller('orders')
@UseGuards()
@ApiTags('orders')
@ApiBearerAuth('JWT-auth')
@ApiResponse({
  status: 400,
  description: 'Bad Request',
  type: ErrorResponseDto,
})
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({
  status: 500,
  description: 'Internal server error',
  type: ErrorResponseDto,
})
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('/create')
  @Roles(ROLES.SHOPPER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiResponse({ status: 201, description: 'Created' })
  createOrder(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(req.user.id, createOrderDto);
  }

  @Get('/shopper/all')
  @Roles(ROLES.SHOPPER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  getOrdersForShopper(@Req() req) {
    return this.orderService.getOrdersForShopper(req.user.id);
  }

  @Get('/shopper/:id')
  @Roles(ROLES.SHOPPER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  getOrderByIdForShopper(@Req() req, @Param('id') orderId: string) {
    return this.orderService.getOrderByIdForShopper(req.user.id, orderId);
  }

  @Get('seller/all')
  @Roles(ROLES.SELLER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  getOrdersForSeller(@Req() req) {
    return this.orderService.getOrdersForSeller(req.user.id);
  }

  @Put(':id/status')
  @Roles(ROLES.SELLER, ROLES.ADMIN)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  updateOrderStatus(
    @Req() req,
    @Param('id') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(
      req.user.id,
      req.user.role,
      orderId,
      updateOrderStatusDto,
    );
  }
}
