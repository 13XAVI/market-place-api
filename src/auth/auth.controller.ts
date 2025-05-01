import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto, CreateUserDto, SignInResponseDto } from '../dtos';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/dtos/errorResponse.dto';

@ApiTags('Auth')
@ApiResponse({
  status: 400,
  description: 'Invalid credentials',
  type: ErrorResponseDto,
})
@ApiResponse({
  status: 500,
  description: 'Internal server error',
  type: ErrorResponseDto,
})
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'Created', type: SignInResponseDto })
  signup(@Body() userDto: CreateUserDto) {
    return this.authService.createUser(userDto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiResponse({ status: 200, description: 'Success', type: SignInResponseDto })
  signin(@Body() authDto: AuthCredentialsDto) {
    return this.authService.userlogin(authDto);
  }
}
