import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { CustomError } from './customError';
  
  @Catch(CustomError)
  export class CustomExceptionFilter implements ExceptionFilter {
    catch(exception: CustomError, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
  
      const status = Number.isInteger(exception.statusCode)
        ? exception.statusCode
        : HttpStatus.INTERNAL_SERVER_ERROR;
  
      response.status(status).json({
        statusCode: status,
        message: exception.message,
      });
    }
  }
  