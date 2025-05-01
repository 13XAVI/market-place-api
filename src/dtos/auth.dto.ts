import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class AuthCredentialsDto {
  @ApiProperty({
    description:
      'Unique identifier for the user (optional, auto-generated if not provided)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;

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

export class CreateUserDto extends AuthCredentialsDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'tresor xavier',
  })
  @IsString({ message: 'User name is required' })
  name: string;

  @ApiProperty({
    description: 'Role of the user (optional, e.g., admin, user)',
    example: 'user',
    required: false,
  })
  @IsString({ message: 'User role must be a string' })
  @Optional()
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
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Role of the user',
    example: 'user',
    required: false,
  })
  role?: string;
}
