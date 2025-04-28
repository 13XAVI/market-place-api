import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { StoreModule } from './store/store.module';
import { OrderModule } from './order/order.module';
import { CategoryModule } from './categories/category.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user/user.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ProductModule,
    StoreModule,
    OrderModule,
    CategoryModule,
    ReviewsModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [UserService],
})
export class AppModule {}
