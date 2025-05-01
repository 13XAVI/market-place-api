import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyDto {
  @ApiProperty({
    description: 'Verification token for email or other verification',
    example: 'abc123xyz789',
  })
  @IsString({ message: 'Token must be string type' })
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
}

export class VerifyResponseDto {
  @ApiProperty({
    description: 'Whether the verification was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Message describing the verification result',
    example: 'Email verified successfully',
  })
  message: string;
}
