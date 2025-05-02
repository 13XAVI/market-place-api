import {
  Body,
  Controller,
  Get,
  Put,
  Query,
  Req,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { VerifyDto } from '../dtos';
import { RoleGuard } from 'src/role/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/role/role.decorator';
import { ROLES } from 'src/utils/enum';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/dtos/errorResponse.dto';
import { CustomExceptionFilter } from 'src/utils/customClass';

@Controller('user')
@ApiBearerAuth('JWT-auth')
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
@ApiResponse({ status: 200, description: 'Success' })
@UseFilters(CustomExceptionFilter)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('verify-email')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SHOPPER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Verify user email' })
  async verifyEmail(@Query('token') verifyDto: VerifyDto) {
    return this.userService.verifyEmail(verifyDto.token);
  }

  @Put('update-profile')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SHOPPER)
  @ApiOperation({ summary: 'Update user profile' })
  async setProfile(@Req() req, @Body() name: string) {
    const id = req.user.id;
    return this.userService.setProfile(id, name);
  }
  @Get('all')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Get all users existing' })
  async getAllUser() {
    return this.userService.getAllUsers();
  }
}
