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
  UseFilters,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewDto, UpdateReviewDto } from 'src/dtos';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard, Roles } from 'src/role';
import { ROLES } from 'src/utils/enum';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/dtos/errorResponse.dto';
import { CustomError, CustomExceptionFilter } from 'src/utils/customClass';

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
@UseFilters(CustomExceptionFilter)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('/add')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SHOPPER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: 'Review added successfully' })
   @ApiOperation({ summary: 'add review as  shopper' })
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
  @Roles(ROLES.SHOPPER)
  @ApiOperation({ summary: 'Get reviews  by product' })
  async getReviewsByProduct(@Param('productId') productId: string) {
    try {
      return await this.reviewService.findReviewsByProduct(productId);
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

  @Get('getOne/:id')
  @ApiResponse({ status: 200, description: 'Review details' })
  @ApiOperation({ summary: 'Get review  of single product' })
  async getReviewById(@Param('id') id: string) {
    try {
      return await this.reviewService.findOneReview(id);
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

  @Patch('update/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SHOPPER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'update reviews  of product by shopper' })
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

  @Delete('remove/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SHOPPER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'remove review  of product by shopper' })
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
