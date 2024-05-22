import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Order } from '@prisma/client';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(user: User): Promise<Order> {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new Error('Carrinho vazio');
    }

    const subtotal = cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    for (const item of cartItems) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new BadRequestException('Produto não encontrado.');
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Estoque insuficiente para o produto ${product.title}.`,
        );
      }

      await this.prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const order = await this.prisma.order.create({
      data: {
        userId: user.id,
        subtotal: subtotal,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    });

    await this.prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });

    return order;
  }

  async getOrders(user: User): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });
  }

  async clearOrders(user: User): Promise<{ count: number }> {
    const orders = await this.prisma.order.findMany({
      where: { userId: user.id },
    });

    const orderIds = orders.map((order) => order.id);

    await this.prisma.orderItem.deleteMany({
      where: { orderId: { in: orderIds } },
    });

    const deletedOrders = await this.prisma.order.deleteMany({
      where: { userId: user.id },
    });

    if (deletedOrders.count === 0) {
      throw new NotFoundException('Nenhum pedido encontrado para deletar!');
    }

    return { count: deletedOrders.count };
  }
}
