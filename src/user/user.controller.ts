import {
  Body,
  Controller,
  Get,
  Put,
  Query,
  Req,
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

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('verify-email')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SHOPPER)
 @UsePipes(new ValidationPipe({ transform: true }))
  async verifyEmail(@Query('token') verifyDto: VerifyDto) {
    return this.userService.verifyEmail(verifyDto.token);
  }

  @Put('update-profile')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.SHOPPER)
  async setProfile(@Req() req, @Body() name: string) {
    const id = req.user.id;
    return this.userService.setProfile(id, name);
  }
  @Get('all')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(ROLES.ADMIN)
  async getAllUser() {
    return this.userService.getAllUsers();
  }
}
