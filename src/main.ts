import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CustomExceptionFilter } from './utils/customClass';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Market API')
    .setDescription(
      'An online marketplace that allows users to buy and sell products, manage their inventory, and process orders.',
    )
    .setVersion('1.0')
    .setContact('Support Team', 'https://market-place-api-ns56.onrender.com/', 'support@example.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('Auth')
    .addTag('User')
    .addTag('categories')
    .addTag('Product')
    .addTag('stores')
    .addTag('orders')
    .addTag('reviews')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
      requestInterceptor: (req) => {
        console.log('Swagger request:', req);
        return req;
      },
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new CustomExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
