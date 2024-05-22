import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { CartItem, User } from '@prisma/client';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(user: User, addToCartDto: AddToCartDto): Promise<CartItem> {
    const { productId, quantity } = addToCartDto;

    if (quantity <= 0) {
      throw new BadRequestException('A quantidade deve ser maior que zero.');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestException('Produto não encontrado.');
    }

    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    const totalQuantity = existingCartItem
      ? existingCartItem.quantity + quantity
      : quantity;

    if (totalQuantity > product.stock) {
      throw new BadRequestException('Quantidade excede o estoque disponível.');
    }

    return this.prisma.cartItem.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      update: { quantity: { increment: quantity } },
      create: {
        userId: user.id,
        productId,
        quantity,
      },
    });
  }

  async getCart(user: User) {
    return this.prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });
  }

  async clearCart(user: User) {
    const result = await this.prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        'Nenhum item no carrinho encontrado para deletar!',
      );
    }

    return result;
  }
}
