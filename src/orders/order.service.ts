import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Order } from '@prisma/client';
import Big from 'big.js';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { format } from 'date-fns';

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
      const discount = new Big(item.product.discountValue ?? 0);
      const price = new Big(item.product.price);
      const finalPrice = price.minus(discount);
      return total.plus(finalPrice.times(item.quantity));
    }, new Big(0));

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
        subtotal: subtotal.toNumber(),
        items: {
          create: cartItems.map((item) => {
            const discount = new Big(item.product.discountValue ?? 0);
            const price = new Big(item.product.price);
            const finalPrice = price.minus(discount);
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: finalPrice.toNumber(),
            };
          }),
        },
      },
    });

    await this.prisma.orderItemHistory.createMany({
      data: cartItems.map((item) => {
        const discount = item.product.discountValue ?? 0;
        return {
          orderId: order.id,
          productId: item.productId,
          title: item.product.title,
          description: item.product.description,
          releaseDate: item.product.releaseDate,
          price: item.product.price,
          category: item.product.category,
          isOnSale: item.product.isOnSale,
          quantity: item.quantity,
          discountValue: discount,
          imageUrl: item.product.imageUrl,
        };
      }),
    });

    await this.prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });

    return order;
  }

  async getOrders(user: User): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: { include: { product: true } },
        history: true,
      },
    });

    return orders.map((order) => ({
      ...order,
      items: order.items.map((item) => {
        const historyItem = order.history.find(
          (historyItem) => historyItem.productId === item.productId,
        );
        return {
          ...item,
          product: item.product
            ? {
                ...item.product,
                releaseDate: format(
                  new Date(item.product.releaseDate),
                  'dd-MM-yyyy',
                ),
              }
            : {
                id: historyItem?.productId,
                title: historyItem?.title || 'Produto excluído',
                description:
                  historyItem?.description || 'Descrição não disponível',
                releaseDate: format(
                  new Date(historyItem?.releaseDate || ''),
                  'dd-MM-yyyy',
                ),
                price: historyItem?.price || 0,
                category: historyItem?.category || 'Categoria não disponível',
                discountValue: historyItem?.discountValue || 0,
                imageUrl: historyItem?.imageUrl || null,
                isOnSale: historyItem?.isOnSale || null,
              },
        };
      }),
      history: order.history.map((historyItem) => ({
        id: historyItem.id,
        orderId: historyItem.orderId,
        product: {
          id: historyItem.productId,
          title: historyItem.title,
          description: historyItem.description,
          releaseDate: format(new Date(historyItem.releaseDate), 'dd-MM-yyyy'),
          price: historyItem.price,
          category: historyItem.category,
          discountValue: historyItem.discountValue,
          imageUrl: historyItem.imageUrl,
          isOnSale: historyItem.isOnSale,
        },
      })),
    }));
  }

  async clearOrders(user: User): Promise<{ count: number }> {
    const orders = await this.prisma.order.findMany({
      where: { userId: user.id },
    });

    const orderIds = orders.map((order) => order.id);

    await this.prisma.orderItemHistory.deleteMany({
      where: { orderId: { in: orderIds } },
    });

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
