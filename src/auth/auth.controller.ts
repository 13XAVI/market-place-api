import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto, CreateUserDto, SignInResponseDto } from '../dtos';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/dtos/errorResponse.dto';
import { ROLES } from 'src/utils/enum';
import { Roles } from 'src/role';
import { CustomExceptionFilter } from 'src/utils/customClass';

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
@UseFilters(CustomExceptionFilter)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @Roles(ROLES.ADMIN)
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
