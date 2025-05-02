import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ROLES } from 'src/utils/enum';

export class AuthCredentialsDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class UpdateAuthDto extends AuthCredentialsDto {
  @ApiProperty({
    description:
      'Unique identifier for the user (optional, auto-generated if not provided)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
}
export class CreateUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'tresor xavier',
  })
  @IsString({ message: 'User name is required' })
  name: string;
  @ApiProperty({
    description: 'User email address',
    example: 'user@gmail.com',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Role of the user (optional )',
    example: 'SHOPPER, ADMIN, SELLER',
    required: false,
  })
  @IsString({ message: 'User role must be a string' })
  @IsOptional()
  @IsEnum(ROLES, { message: 'Role must be one either SHOPPER, ADMIN, SELLER' })
  role?: string;
}

export class SignInResponseDto {
  @ApiProperty({
    description: 'JWT access token ',
    example: 'token..',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'hello@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Emmy',
  })
  name: string;

  @ApiProperty({
    description: 'Role of the user',
    example: 'user',
    required: false,
  })
  role?: string;
}
