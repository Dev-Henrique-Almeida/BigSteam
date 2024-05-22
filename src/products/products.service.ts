import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';
import { NotFoundException } from '../common/exceptions/not-found.exception';
import { CreationFailedException } from '../common/exceptions/creation-failed.exception';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    try {
      return await this.prisma.product.create({ data });
    } catch (error) {
      throw new CreationFailedException('Falha ao criar um novo produto!');
    }
  }

  async createMany(data: Prisma.ProductCreateInput[]): Promise<Product[]> {
    try {
      const createdProducts = await Promise.all(
        data.map((product) => this.prisma.product.create({ data: product })),
      );
      if (createdProducts.length === 0) {
        throw new CreationFailedException('Falha ao criar novos produtos!');
      }
      return createdProducts;
    } catch (error) {
      throw new CreationFailedException('Falha ao criar novos produtos!');
    }
  }

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany();
    if (products.length === 0) {
      throw new NotFoundException('Nenhum produto foi encontrado!');
    }
    return products;
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Produto com ID ${id}, não encontrado!`);
    }
    return product;
  }

  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    const product = await this.prisma.product.update({
      where: { id },
      data,
    });
    if (!product) {
      throw new NotFoundException(`Produto com ID ${id}, não encontrado!`);
    }
    return product;
  }

  async remove(id: number): Promise<Product> {
    const product = await this.prisma.product.delete({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Produto com ID ${id}, não encontrado!`);
    }
    return product;
  }

  async removeAll(): Promise<{ count: number }> {
    const result = await this.prisma.product.deleteMany({});
    if (result.count === 0) {
      throw new NotFoundException('Nenhum produto encontrado para deletar!');
    }
    return result;
  }
}
