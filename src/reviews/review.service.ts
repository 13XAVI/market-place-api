// src/review/review.service.ts
import { Injectable } from '@nestjs/common';
import { ReviewDto, UpdateReviewDto } from 'src/dtos';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomError, CustomResponse } from 'src/utils/customClass';
import { ROLES } from 'src/utils/enum';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async createReview(userId: string, reviewDto: ReviewDto): Promise<CustomResponse<any>> {
    const { rating, comment, productId } = reviewDto;


    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new CustomError(404, 'Product not found');
    }

    const foundUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!foundUser || foundUser.role.name !== ROLES.SHOPPER) {
      throw new CustomError(403, 'Only shoppers can create reviews');
    }

    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: 'COMPLETED',
        },
      },
    });
    if (!hasPurchased) {
      throw new CustomError(403, 'You can only review products you have purchased');
    }

    const review = await this.prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        productId,
      },
    });

    return {
      message: 'Review created successfully',
      data: review,
    };
  }

  async findReviewsByProduct(productId: string): Promise<CustomResponse<any[]>> {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      include: { user: true }, 
    });

    return {
      message: reviews.length > 0 ? 'Reviews retrieved successfully' : 'No reviews found for this product',
      data: reviews,
    };
  }

  async findOneReview(id: string): Promise<CustomResponse<any>> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { user: true, product: true },
    });
    if (!review) {
      throw new CustomError(404, 'Review not found');
    }

    return {
      message: 'Review retrieved successfully',
      data: review,
    };
  }

  async updateReview(id: string, userId: string, updateReviewDto: UpdateReviewDto): Promise<CustomResponse<any>> {
    const { rating, comment } = updateReviewDto;

    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new CustomError(404, 'Review not found');
    }

    if (review.userId !== userId) {
      throw new CustomError(403, 'You are not allowed to update this review');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: {
        rating: rating !== undefined ? rating : review.rating,
        comment: comment !== undefined ? comment : review.comment,
      },
    });

    return {
      message: 'Review updated successfully',
      data: updatedReview,
    };
  }

  async deleteReview(id: string, userId: string): Promise<CustomResponse<null>> {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new CustomError(404, 'Review not found');
    }

    if (review.userId !== userId) {
      throw new CustomError(403, 'You are not allowed to delete this review');
    }

    await this.prisma.review.delete({ where: { id } });

    return {
      message: 'Review deleted successfully',
      data: null,
    };
  }
}