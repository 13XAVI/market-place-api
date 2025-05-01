import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from '../dtos';
import { Store } from '@prisma/client';
import { CustomError, CustomResponse } from '../utils/customClass';
import { ROLES } from '../utils/enum';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class StoreService implements OnModuleInit {
  private producer: Producer;

  constructor(private prisma: PrismaService) {
    const kafka = new Kafka({
      clientId: 'market-api',
      brokers: [process.env.KAFKA_BROKERS || 'kafka:9092'],
    });
    this.producer = kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  /**
   * Creates a new store for a seller.
   * Only sellers can create stores, and they are set as the owner.
   * Products can be linked if they are not already associated with another store.
   */
  async createStore(
    userId: string,
    userRole: string,
    createStoreDto: CreateStoreDto,
  ): Promise<CustomResponse<Store>> {
    if (userRole !== ROLES.SELLER) {
      throw new CustomError(403, 'Only sellers can create stores');
    }

    const { name, productIds } = createStoreDto;

    if (productIds && productIds.length > 0) {
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds }, storeId: null },
        select: { id: true },
      });

      if (products.length !== productIds.length) {
        throw new CustomError(
          400,
          'One or more products are already associated with a store or do not exist',
        );
      }
    }

    const store = await this.prisma.$transaction(async (prisma) => {
      const newStore = await prisma.store.create({
        data: {
          name,
          ownerId: userId,
        },
      });

      if (productIds && productIds.length > 0) {
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { storeId: newStore.id },
        });
      }

      return prisma.store.findUnique({
        where: { id: newStore.id },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              isFeatured: true,
            },
          },
        },
      });
    });

    await this.producer.send({
      topic: 'store-events',
      messages: [
        {
          key: store?.id,
          value: JSON.stringify({
            eventType: 'STORE_CREATED',
            storeId: store?.id,
            name: store?.name,
            ownerId: store?.ownerId,
            createdAt: store?.createdAt,
          }),
        },
      ],
    });

    return {
      message: 'Store Successfully Created',
      data: store,
    };
  }

  /**
   * Retrieves a store by its ID, including its products and owner details.
   */
  async getStoreById(storeId: string): Promise<CustomResponse<Store>> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            isFeatured: true,
          },
        },
        owner: { select: { name: true, email: true } },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return {
      message: 'Successfully Retrieved Store',
      data: store,
    };
  }

  /**
   * Retrieves all stores with their products.
   */
  async getAllStores(): Promise<CustomResponse<Store[]>> {
    const stores = await this.prisma.store.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            isFeatured: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Successfully Retrieved All Stores',
      data: stores,
    };
  }

  /**
   * Updates a store. Only the owner (seller) or an admin can update it.
   */
  async updateStore(
    userId: string,
    userRole: string,
    storeId: string,
    updateStoreDto: UpdateStoreDto,
  ): Promise<CustomResponse<Store>> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (userRole !== ROLES.ADMIN && store.ownerId !== userId) {
      throw new CustomError(
        403,
        'You do not have permission to update this store',
      );
    }

    const updatedStore = await this.prisma.store.update({
      where: { id: storeId },
      data: updateStoreDto,
    });

    await this.producer.send({
      topic: 'store-events',
      messages: [
        {
          key: storeId,
          value: JSON.stringify({
            eventType: 'STORE_UPDATED',
            storeId,
            name: updatedStore.name,
            updatedAt: updatedStore.updatedAt,
          }),
        },
      ],
    });

    return {
      message: 'Store Successfully Updated',
      data: updatedStore,
    };
  }

  /**
   * Deletes a store. Only the owner (seller) or an admin can delete it.
   * Prevents deletion if the store has associated products.
   */
  async deleteStore(
    userId: string,
    userRole: string,
    storeId: string,
  ): Promise<CustomResponse<any>> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (userRole !== ROLES.ADMIN && store.ownerId !== userId) {
      throw new CustomError(
        403,
        'You do not have permission to delete this store',
      );
    }

    const products = await this.prisma.product.findMany({
      where: { storeId },
    });

    if (products.length > 0) {
      throw new CustomError(
        400,
        'Cannot delete store with associated products',
      );
    }

    await this.prisma.store.delete({
      where: { id: storeId },
    });

    await this.producer.send({
      topic: 'store-events',
      messages: [
        {
          key: storeId,
          value: JSON.stringify({
            eventType: 'STORE_DELETED',
            storeId,
            deletedAt: new Date(),
          }),
        },
      ],
    });

    return {
      message: 'Store Successfully Deleted',
      data: null,
    };
  }
}
