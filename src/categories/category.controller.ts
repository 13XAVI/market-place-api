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
} from '@nestjs/common';
import { CategoryService } from './category.service';

import { ROLES } from '../utils/enum';
import { AuthGuard } from '@nestjs/passport';
import { CategoryDto } from 'src/dtos';
import { RoleGuard, Roles } from 'src/role';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/dtos/errorResponse.dto';

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
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createCategory(@Body() categoryDto: CategoryDto) {
    return this.categoryService.createCategory(categoryDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCategory(
    @Param('id') id: string,
    @Body() categoryDto: CategoryDto,
  ) {
    return this.categoryService.updateCategory(id, categoryDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.ADMIN)
  async getOneCategory(@Param('id') id: string) {
    return this.categoryService.findOneCategory(id);
  }
  @Get('all')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.ADMIN)
  async getAllCategories() {
    return this.categoryService.findAllCategory();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.ADMIN)
  @ApiResponse({ status: 200, description: 'Success' })
  async deleteOneCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
