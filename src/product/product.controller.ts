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
import { ProductService } from './product.service';
import { ProductDto } from '../dtos/product.dto';
import { CustomError, CustomExceptionFilter } from 'src/utils/customClass';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard, Roles } from 'src/role';
import { ROLES } from 'src/utils/enum';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
@UseFilters(CustomExceptionFilter)
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Post('create')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SELLER)
  @ApiResponse({ status: 201, description: 'Created' })
   @ApiOperation({ summary: 'Create Product for the seller' })
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
  @ApiOperation({ summary: 'Get all product of the seller' })
  async getAllProducts() {
    try {
      return await this.productService.findAllProducts();
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

  @Get('getOne/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SELLER)
  @ApiOperation({ summary: 'Get one product of the seller' })
  async getProductById(@Param('id') id: string) {
    try {
      return await this.productService.findOneProduct(id);
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

  @Patch('update/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SELLER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'update product of the seller' })
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

  @Delete('delete/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SELLER)
  @ApiOperation({ summary: 'Delete product of the seller' })
  async deleteProduct(@Param('id') id: string, @Req() req: any) {
    try {
      const userId = req.user.id;
      return await this.productService.deleteProduct(id, userId);
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }
}
