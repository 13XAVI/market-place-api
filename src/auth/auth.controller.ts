import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto, CreateUserDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() userDto: CreateUserDto) {
    return this.authService.createUser(userDto);
  }

  @Post('signin')
  signin(@Body() authDto: AuthCredentialsDto) {
    return this.authService.userlogin(authDto);
  }
}
