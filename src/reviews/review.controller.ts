import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewDto, UpdateReviewDto } from 'src/dtos';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard, Roles } from 'src/role';
import { ROLES } from 'src/utils/enum';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/dtos/errorResponse.dto';
import { CustomError } from 'src/utils/customClass';

@Controller('reviews')
@ApiTags('reviews')
@ApiResponse({
  status: 400,
  description: 'Bad Request',
  type: ErrorResponseDto,
})
@ApiResponse({ status: 401, description: 'Unauthorized Access' })
@ApiResponse({
  status: 500,
  description: 'Internal server error',
  type: ErrorResponseDto,
})
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SHOPPER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  async createReview(@Body() reviewDto: ReviewDto, @Req() req: any) {
    try {
      const userId = req.user.id;
      return await this.reviewService.createReview(userId, reviewDto);
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

  @Get('product/:productId')
  @ApiResponse({ status: 200, description: 'List of reviews for the product' })
  async getReviewsByProduct(@Param('productId') productId: string) {
    try {
      return await this.reviewService.findReviewsByProduct(productId);
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Review details' })
  async getReviewById(@Param('id') id: string) {
    try {
      return await this.reviewService.findOneReview(id);
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SHOPPER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  async updateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req: any,
  ) {
    try {
      const userId = req.user.id;
      return await this.reviewService.updateReview(id, userId, updateReviewDto);
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SHOPPER)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async deleteReview(@Param('id') id: string, @Req() req: any) {
    try {
      const userId = req.user.id;
      return await this.reviewService.deleteReview(id, userId);
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }
}
