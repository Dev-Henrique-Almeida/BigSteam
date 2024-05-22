import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from './products/products.module';
/* import { UsersModule } from './users/users.module'; */

@Module({
  imports: [PrismaModule, ProductsModule /* UsersModule */],
})
export class AppModule {}
