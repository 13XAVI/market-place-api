import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyDto {
  @IsString({ message: 'toke must be string type' })
  @IsNotEmpty({ message: 'token  is required' })
  token: string;
}
