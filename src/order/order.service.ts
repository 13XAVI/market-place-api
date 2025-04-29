import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dtos';
import { Order } from '@prisma/client';
import { totalPriceofOrder } from 'src/utils/functions/price';
import { CustomError } from 'src/utils/customClass';
import { ORDER_STATUS, ROLES } from 'src/utils/enum';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    const { items } = createOrderDto;

    if (!items || items.length === 0) {
      throw new CustomError(400, 'At least one item is required');
    }

 
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, storeId: true },
    });

    if (products.length !== items.length) {
      throw new CustomError(404, ' products not found');
    }

    const total = totalPriceofOrder(products, items);

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        status: ORDER_STATUS.PENDING,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    return order;
  }

  async getOrdersForShopper(userId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true,
                price: true,
                store: {
                  select: {
                    name: true,
                    owner: true,
                    products: true,
                    _count: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderByIdForShopper(
    userId: string,
    orderId: string,
  ): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true,
                price: true,
                store: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this order',
      );
    }

    return order;
  }

  async getOrdersForSeller(sellerId: string): Promise<Order[]> {

    const stores = await this.prisma.store.findMany({
      where: { ownerId: sellerId },
      select: { id: true },
    });
    const storeIds = stores.map((store) => store.id);

    return this.prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              storeId: { in: storeIds },
            },
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                storeId: true,
                store: { select: { name: true } },
              },
            },
          },
        },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(
    userId: string,
    userRole: string,
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const { status } = updateOrderStatusDto;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { storeId: true } } } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userRole === ROLES.ADMIN) {

      return this.prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: { items: { include: { product: true } } },
      });
    } else if (userRole === ROLES.SELLER) {
      
      const stores = await this.prisma.store.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });
      const storeIds = stores.map((store) => store.id);

      const hasItemsFromStore = order.items.some(
        (item) =>
          item.product.storeId && storeIds.includes(item.product.storeId),
      );

      if (!hasItemsFromStore) {
        throw new CustomError(
          403,
          'You do not have permission to update this order',
        );
      }

      return this.prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: { items: { include: { product: true } } },
      });
    } else {
      throw new CustomError(
        403,
        'You do not have permission to update this order',
      );
    }
  }
}
