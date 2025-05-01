import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code of the error',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message describing the issue',
    example: 'Invalid email or password format',
  })
  message: string;

  @ApiProperty({
    description: 'Type of error',
    example: 'BadRequestException',
  })
  error: string;
}
