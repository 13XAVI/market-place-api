import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dtos';
import { Order } from '@prisma/client';
import { totalPriceofOrder } from 'src/utils/functions/price';
import { CustomError, CustomResponse } from 'src/utils/customClass';
import { ORDER_STATUS, ROLES } from 'src/utils/enum';
// import { Kafka } from 'kafkajs';

@Injectable()
export class OrderService {
  // private kafka: Kafka;
  // private producer;

  constructor(private prisma: PrismaService) {
    // this.kafka = new Kafka({
    //   clientId: 'market-api',
    //   brokers: [process.env.KAFKA_BROKERS || 'kafka:9092'],
    // });
    // this.producer = this.kafka.producer();
  }
  // async onModuleInit() {
  //   await this.producer.connect();
  // }

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<CustomResponse<Order>> {
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
      throw new CustomError(404, 'Products not found');
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

    // await this.producer.send({
    //   topic: 'order-events',
    //   messages: [
    //     {
    //       key: order.id,
    //       value: JSON.stringify({
    //         eventType: 'ORDER_CREATED',
    //         orderId: order.id,
    //         userId: order.userId,
    //         total: order.total,
    //         status: order.status,
    //         items: order.items,
    //         createdAt: order.createdAt,
    //       }),
    //     },
    //   ],
    // });

    return {
      message: 'Successfully  created order',
      data: order,
    };
  }



  async getOrdersForShopper(userId: string): Promise<CustomResponse<Order[]>> {
    const orders = await this.prisma.order.findMany({
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
    return {
      message: 'Successfully retrieved orders',
      data: orders,
    };
  }

  async getOrderByIdForShopper(
    userId: string,
    orderId: string,
  ): Promise<CustomResponse<Order>> {
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
      throw new CustomError(404, 'Order not found');
    }
    if (order.userId !== userId) {
      throw new CustomError(
        400,
        'You do not have permission to view this order',
      );
    }

    return {
      message: 'successfully retrived order',
      data: order,
    };
  }



  async getOrdersForSeller(sellerId: string): Promise<CustomResponse<Order[]>> {
    const stores = await this.prisma.store.findMany({
      where: { ownerId: sellerId },
      select: { id: true },
    });
    const storeIds = stores.map((store) => store.id);

    const orders = await this.prisma.order.findMany({
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
    return {
      message: 'Orders retrived Successfull',
      data: orders,
    };
  }

  async updateOrderStatus(
    userId: string,
    userRole: string,
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<CustomResponse<Order>> {
    const { status } = updateOrderStatusDto;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { storeId: true } } } },
      },
    });

    if (!order) {
      throw new CustomError(404, 'Order not found');
    }

    if (userRole === ROLES.ADMIN) {
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: { items: { include: { product: true } } },
      });

      // await this.producer.send({
      //   topic: 'order-events',
      //   messages: [
      //     {
      //       key: orderId,
      //       value: JSON.stringify({
      //         eventType: 'ORDER_STATUS_UPDATED',
      //         orderId,
      //         userId: order.userId,
      //         status,
      //         updatedAt: new Date(),
      //       }),
      //     },
      //   ],
      // });

      return {
        message: 'Successfully updated order',
        data: updatedOrder,
      };
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

      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: { items: { include: { product: true } } },
      });

      // await this.producer.send({
      //   topic: 'order-events',
      //   messages: [
      //     {
      //       key: orderId,
      //       value: JSON.stringify({
      //         eventType: 'ORDER_STATUS_UPDATED',
      //         orderId,
      //         userId: order.userId,
      //         status,
      //         updatedAt: new Date(),
      //       }),
      //     },
      //   ],
      // });

      return {
        message: 'Successfully update Order Status',
        data: updatedOrder,
      };
    } else {
      throw new CustomError(
        403,
        'You do not have permission to update this order',
      );
    }
  }
}
