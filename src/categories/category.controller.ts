import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
  Get,
  UsePipes,
  ValidationPipe,
  Delete,
  UseFilters,
} from '@nestjs/common';
import { CategoryService } from './category.service';

import { ROLES } from '../utils/enum';
import { AuthGuard } from '@nestjs/passport';
import { CategoryDto } from 'src/dtos';
import { RoleGuard, Roles } from 'src/role';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/dtos/errorResponse.dto';
import { CustomExceptionFilter } from 'src/utils/customClass';

@ApiTags('categories')
@Controller('categories')
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
@ApiResponse({ status: 200, description: 'Success' })
@UseFilters(CustomExceptionFilter)
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'create product category' })
  async createCategory(@Body() categoryDto: CategoryDto) {
    return this.categoryService.createCategory(categoryDto);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Get all existing categories' })
  async getAllCategories() {
    return this.categoryService.AllCategory();
  }

  @Put('update/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'update all category by id' })
  async updateCategory(
    @Param('id') id: string,
    @Body() categoryDto: CategoryDto,
  ) {
    return this.categoryService.updateCategory(id, categoryDto);
  }

  @Get('getOne/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'retrieve single category' })
  async getOneCategory(@Param('id') id: string) {
    return this.categoryService.OneCategory(id);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.ADMIN)
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiOperation({ summary: 'Delete category' })
  async deleteOneCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
