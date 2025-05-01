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
import { ProductService } from './product.service';
import { ProductDto } from '../dtos/product.dto';
import { CustomError } from 'src/utils/customClass';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard, Roles } from 'src/role';
import { ROLES } from 'src/utils/enum';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/dtos/errorResponse.dto';

@Controller('products')
@ApiBearerAuth('JWT-auth')
@ApiResponse({
  status: 400,
  description: 'Bad Request',
  type: ErrorResponseDto,
})
@ApiResponse({ status: 401, description: 'Unauthorized Acess' })
@ApiResponse({
  status: 500,
  description: 'Internal server error',
  type: ErrorResponseDto,
})
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Post('create')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SELLER)
  @ApiResponse({ status: 201, description: 'Created' })
  async createProduct(@Body() productDto: ProductDto, @Req() req: any) {
    try {
      const userId = req.user.id;
      return await this.productService.createProduct(productDto, userId);
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SELLER)
  async getAllProducts() {
    try {
      return await this.productService.findAllProducts();
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SELLER)
  async getProductById(@Param('id') id: string) {
    try {
      return await this.productService.findOneProduct(id);
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SELLER)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateProduct(
    @Param('id') id: string,
    @Body() productDto: ProductDto,
    @Req() req: any,
  ) {
    try {
      const userId = req.user.id;
      return await this.productService.updateProduct(id, productDto, userId);
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SELLER)
  async deleteProduct(@Param('id') id: string, @Req() req: any) {
    try {
      const userId = req.user.id;
      return await this.productService.deleteProduct(id, userId);
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }
}
