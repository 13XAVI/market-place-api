import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryDto } from '../dtos';
import { CustomError, CustomResponse } from '../utils/customClass';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(categoryDto: CategoryDto): Promise<CustomResponse<any>> {
    try {
      if (!categoryDto.name) {
        throw new CustomError(400, 'Category name is required');
      }

      const existingCategory = await this.prisma.category.findUnique({
        where: {
          name: categoryDto.name.toUpperCase(),
        },
      });

      if (existingCategory) {
        throw new CustomError(400, 'Category already exists');
      }

      const newCategory = await this.prisma.category.create({
        data: {
          name: categoryDto.name.toUpperCase(),
          description: categoryDto.description,
        },
      });

      return {
        message: 'Category created successfully',
        data: newCategory,
      };
    } catch (error) {
      console.error('Error in createCategory:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : 'Unexpected error occurred';
      throw new CustomError(statusCode, errorMessage);
    }
  }

  async updateCategory(
    id: string,
    categoryDto: CategoryDto,
  ): Promise<CustomResponse<any>> {
    try {
      if (!categoryDto.name) {
        throw new CustomError(400, 'Category name is required');
      }

      const existingCategory = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new CustomError(404, 'Category not found');
      }

      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: {
          name: categoryDto.name.toUpperCase(),
          description: categoryDto.description,
        },
      });

      return {
        message: 'Category updated successfully',
        data: updatedCategory,
      };
    } catch (error) {
      console.error('Error in updateCategory:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : 'Unexpected error occurred';
      throw new CustomError(statusCode, errorMessage);
    }
  }

  async OneCategory(id: string): Promise<CustomResponse<any>> {
    try {
      if (!id) {
        throw new CustomError(400, 'Category ID is required');
      }

      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              isFeatured: true,
              createdAt: true,
            },
          },
        },
      });

      if (!category) {
        throw new CustomError(404, 'Category not found');
      }

      return {
        message: 'Category retrieved successfully',
        data: category,
      };
    } catch (error) {
      console.error('Error in findOneCategory:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : 'Unexpected error occurred';
      throw new CustomError(statusCode, errorMessage);
    }
  }

  async AllCategory(): Promise<CustomResponse<any>> {
    try {
      const categories = await this.prisma.category.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
      });

      return {
        message: 'Categories retrieved successfully',
        data: categories,
      };
    } catch (error) {
      console.error('Error in findAllCategory:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : 'Unexpected error occurred';
      throw new CustomError(statusCode, errorMessage);
    }
  }
  async deleteCategory(id: string): Promise<CustomResponse<any>> {
    try {
      if (!id) {
        throw new CustomError(400, 'Category ID is required');
      }

      const category = await this.prisma.category.findUnique({
        where: { id },
        include: { products: { select: { id: true } } },
      });

      if (!category) {
        throw new CustomError(404, 'Category not found');
      }

      if (category.products.length > 0) {
        throw new CustomError(
          400,
          'Cannot delete category with associated products',
        );
      }

      await this.prisma.category.delete({
        where: { id },
      });

      return {
        message: 'Category deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : 'Unexpected error occurred';
      throw new CustomError(statusCode, errorMessage);
    }
  }
}
