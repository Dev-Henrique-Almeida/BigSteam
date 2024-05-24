import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { CartItem, User } from '@prisma/client';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import Big from 'big.js';
import { format } from 'date-fns';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(user: User, addToCartDto: AddToCartDto): Promise<CartItem[]> {
    const { productId, quantity } = addToCartDto;

    if (productId.length !== quantity.length) {
      throw new BadRequestException(
        'Product IDs and quantities must have the same length.',
      );
    }

    const cartItems: CartItem[] = [];

    for (let i = 0; i < productId.length; i++) {
      const product = await this.prisma.product.findUnique({
        where: { id: productId[i] },
      });

      if (!product) {
        throw new BadRequestException(
          `Produto com ID ${productId[i]} não encontrado.`,
        );
      }

      const totalQuantity = await this.prisma.cartItem.upsert({
        where: {
          userId_productId: { userId: user.id, productId: productId[i] },
        },
        update: { quantity: { increment: quantity[i] } },
        create: {
          userId: user.id,
          productId: productId[i],
          quantity: quantity[i],
        },
      });

      cartItems.push(totalQuantity);
    }

    return cartItems;
  }

  async getCart(user: User) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    const subtotal = cartItems.reduce((total, item) => {
      const discount = new Big(item.product.discountValue ?? 0);
      const price = new Big(item.product.price);
      const finalPrice = price.minus(discount);
      return total.plus(finalPrice.times(item.quantity));
    }, new Big(0));

    return {
      items: cartItems.map((item) => ({
        ...item,
        product: {
          ...item.product,
          imageUrl: item.product.imageUrl,
          releaseDate: format(new Date(item.product.releaseDate), 'dd-MM-yyyy'), // Incluindo a formatação da data
        },
      })),
      subtotal: subtotal.toNumber(),
    };
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
