import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CustomError, CustomResponse } from 'src/utils/customClass';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async verifyEmail(token: string): Promise<CustomResponse<any>> {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    return { message: 'Email verified successfully', data: '' };
  }
  async setProfile(id: string, name: string): Promise<CustomResponse<any>> {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      include: { profile: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: id },
      data: {
        name: name,
        isProfileSet: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isProfileSet: true,
      },
    });

    return {
      message: 'Profile set successfully',
      data: updatedUser,
    };
  }
  async getAllUsers(): Promise<CustomResponse<any>> {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          isEmailVerified: true,
          isProfileSet: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          Store: {
            select: {
              id: true,
              name: true,
            },
          },
          orders: {
            select: {
              id: true,
              total: true,
              status: true,
            },
          },
          Review: {
            select: {
              id: true,
              rating: true,
            },
          },
        },
      });
      return {
        message: 'Users Retrieved Successfully',
        data: users,
      };
    } catch (error) {
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : 'Unexpected error occurred';
      throw new CustomError(statusCode, errorMessage);
    }
  }
}
