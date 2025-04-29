// src/store/store.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from '../dtos';
import { Store } from '@prisma/client';
import { CustomError, CustomResponse } from '../utils/customClass';
import { ROLES } from '../utils/enum';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async createStore(
    userId: string,
    createStoreDto: CreateStoreDto,
  ): Promise<CustomResponse<Store>> {
    const { name, productIds } = createStoreDto;

    // Check if user already has a store (optional)
    const existingStore = await this.prisma.store.findFirst({
      where: { ownerId: userId },
    });

    if (existingStore) {
      throw new CustomError(400, 'User already has a store');
    }

    // Validate product IDs
    if (productIds && productIds.length > 0) {
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          storeId: true,
          store: { select: { ownerId: true } },
        },
      });

      if (products.length !== productIds.length) {
        throw new CustomError(404, 'One or more products not found');
      }

      // Check permissions (sellers can only link their own products, admins can link any)
      for (const product of products) {
        if (
          product.storeId &&
          product.store?.ownerId !== userId &&
          userId !== ROLES.ADMIN
        ) {
          throw new CustomError(
            403,
            'You do not have permission to link one or more products',
          );
        }
      }
    }


    const store = await this.prisma.$transaction(async (prisma) => {
 
      const store = await prisma.store.create({
        data: {
          name,
          ownerId: userId,
        },
      });

      // Link products to the store
      if (productIds && productIds.length > 0) {
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { storeId: store.id },
        });
      }

      // Return the store with linked products
      return prisma.store.findUnique({
        where: { id: store.id },
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

    return {
      message: 'Store Successfull Created',
      data: store,
    };
  }

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
      message: 'Successfully Retrieved Store id',
      data: store,
    };
  }

  async getAllStores(): Promise<CustomResponse<Store[]>> {
    const foundStores = await this.prisma.store.findMany({
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
      message: 'Successfull retrived',
      data: foundStores,
    };
  }

  async updateStore(
    userId: string,
    userRole: string,
    storeId: string,
    updateStoreDto: UpdateStoreDto,
  ): Promise<CustomResponse<Store>> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    const role = await this.prisma.role.findUnique({
      where: { id: userRole },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (role?.name !== ROLES.ADMIN && store.ownerId !== userId) {
      throw new CustomError(
        403,
        'You do not have permission to update this store',
      );
    }

    const updatedStore = await this.prisma.store.update({
      where: { id: storeId },
      data: updateStoreDto,
    });

    return {
      message: 'Store Successfully Updated',
      data: updatedStore,
    };
  }

  async deleteStore(
    userId: string,
    userRole: string,
    storeId: string,
  ): Promise<CustomResponse<any>> {

    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    const Role = await this.prisma.role.findUnique({
      where: { id: userRole },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (Role?.name !== ROLES.ADMIN && store.ownerId !== userId) {
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
    return {
      message: 'sucessfull Deleted',
      data: '',
    };
  }
}
