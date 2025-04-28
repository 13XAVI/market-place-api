import { Optional } from '@nestjs/common';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class AuthCredentialsDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class CreateUserDto extends AuthCredentialsDto {
  @IsString({message:"user name is Required"})
  name: string;
  @IsString({message:"user Role must Be a string"})
  @Optional()
  role?: string;
}
