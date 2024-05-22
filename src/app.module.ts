import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/order.module';

@Module({
  imports: [ProductsModule, UsersModule, AuthModule, CartModule, OrdersModule],
})
export class AppModule {}
