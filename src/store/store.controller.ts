import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateStoreDto, UpdateStoreDto } from 'src/dtos';
import { RoleGuard, Roles } from 'src/role';
import { ROLES } from 'src/utils/enum';
import { StoreService } from './store.service';
import { CustomError, CustomExceptionFilter } from 'src/utils/customClass';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/dtos/errorResponse.dto';

@Controller('stores')
@ApiTags('stores')
@ApiBearerAuth('JWT-auth')
@ApiResponse({ status: 401, description: 'Unauthorized Acess' })
@ApiResponse({
  status: 400,
  description: 'Bad Request',
  type: ErrorResponseDto,
})
@ApiResponse({
  status: 500,
  description: 'Internal server error',
  type: ErrorResponseDto,
})
@ApiResponse({ status: 201, description: 'Succesfully created Strore' })
@ApiResponse({ status: 200, description: 'Success' })
@UseFilters(CustomExceptionFilter)
export class StoreController {
  constructor(private storeService: StoreService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SELLER)
  @ApiOperation({ summary: 'create  Store by Seller' })
  createStore(@Req() req, @Body() createStoreDto: CreateStoreDto) {
    try {
      return this.storeService.createStore(
        req.user.id,
        req.user.role,
        createStoreDto,
      );
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

  @Get('all')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Fetch all Store by Admin' })
  getAllStores() {
    try {
      return this.storeService.getAllStores();
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

 

  @Get('getOne/:id')
  getStoreById(@Param('id') storeId: string) {
    try {
      return this.storeService.getStoreById(storeId);
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

  @Put('update/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SELLER, ROLES.ADMIN)
  updateStore(
    @Req() req,
    @Param('id') storeId: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    try {
      return this.storeService.updateStore(
        req.user.id,
        req.user.role,
        storeId,
        updateStoreDto,
      );
    } catch (error) {
      throw new CustomError(error.message, error.statusCode || 500);
    }
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SELLER, ROLES.ADMIN)
  deleteStore(@Req() req, @Param('id') storeId: string) {
    try {
      return this.storeService.deleteStore(req.user.id, req.user.role, storeId);
    } catch (error) {
      throw new CustomError(error.statusCode || 500, error.message);
    }
  }
}
