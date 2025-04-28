import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductDto } from '../dtos';
import { CustomError, CustomResponse } from '../utils/customClass';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(
    productDto: ProductDto,
    userId: string,
  ): Promise<CustomResponse<any>> {
    const storeId = productDto.storeId;
    if (storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: storeId },
      });
      if (!store) {
        throw new CustomError(404, 'Store not found');
      }
      if (store.ownerId !== userId) {
        throw new CustomError(403, 'You do not own this store');
      }
    }

    const product = await this.prisma.product.create({
      data: {
        name: productDto.name,
        image: productDto.image,
        price: productDto.price,
        categoryId: productDto.categoryId,
        storeId: storeId || null,
        isFeatured: productDto.isFeatured || false,
      },
    });

    return {
      message: 'Product created successfully',
      data: product,
    };
  }

  async findOneProduct(id: string): Promise<CustomResponse<any>> {
    if (!id) {
      throw new CustomError(400, 'Product ID is required');
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        store: { select: { id: true, name: true } },
        reviews: {
          select: { id: true, rating: true, comment: true, createdAt: true },
        },
      },
    });

    if (!product) {
      throw new CustomError(404, 'Product not found');
    }

    return {
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  async findAllProducts(): Promise<CustomResponse<any>> {
    const products = await this.prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true } },
        store: { select: { id: true, name: true } },
      },
    });

    return {
      message: 'Products retrieved successfully',
      data: products,
    };
  }

  async updateProduct(
    id: string,
    productDto: ProductDto,
    userId: string,
  ): Promise<CustomResponse<any>> {
    if (!id) {
      throw new CustomError(400, 'Product ID is required');
    }

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new CustomError(404, 'Product not found');
    }

    // Verify user owns the store (if storeId exists)
    if (product.storeId && product.storeId !== productDto.storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: product.storeId },
      });
      if (store && store.ownerId !== userId) {
        throw new CustomError(403, 'You do not own this product');
      }
    }

    // Check if category exists
    if (productDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: productDto.categoryId },
      });
      if (!category) {
        throw new CustomError(404, 'Category not found');
      }
    }

    // Check if new storeId is valid
    const storeId = productDto.storeId;
    if (storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: storeId },
      });
      if (!store) {
        throw new CustomError(404, 'Store not found');
      }
      if (store.ownerId !== userId) {
        throw new CustomError(403, 'You do not own this store');
      }
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        name: productDto.name,
        image: productDto.image,
        price: productDto.price,
        categoryId: productDto.categoryId,
        storeId: storeId || null,
        isFeatured: productDto.isFeatured,
      },
    });

    return {
      message: 'Product updated successfully',
      data: updatedProduct,
    };
  }

  async deleteProduct(
    id: string,
    userId: string,
  ): Promise<CustomResponse<any>> {
    if (!id) {
      throw new CustomError(400, 'Product ID is required');
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: { select: { id: true } },
        reviews: { select: { id: true } },
      },
    });

    if (!product) {
      throw new CustomError(404, 'Product not found');
    }

    // Verify user owns the store (if storeId exists)
    if (product.storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: product.storeId },
      });
      if (store && store.ownerId !== userId) {
        throw new CustomError(403, 'You do not own this product');
      }
    }

    // Check for dependencies
    if (product.orderItems.length > 0) {
      throw new CustomError(
        400,
        'Cannot delete product with associated order items',
      );
    }
    if (product.reviews.length > 0) {
      throw new CustomError(
        400,
        'Cannot delete product with associated reviews',
      );
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      message: 'Product deleted successfully',
      data: null,
    };
  }
}
