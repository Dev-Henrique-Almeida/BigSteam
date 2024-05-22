import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';
import { NotFoundException } from '../common/exceptions/not-found.exception';
import { CreationFailedException } from '../common/exceptions/creation-failed.exception';
import { FormattedProduct } from './interfaces/formatted-product.interface';
import { format, parse } from 'date-fns';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private formatProduct(product: Product): FormattedProduct {
    return {
      ...product,
      releaseDate: format(product.releaseDate, 'dd-MM-yyyy'),
      stock: product.stock,
    };
  }

  async create(data: Prisma.ProductCreateInput): Promise<FormattedProduct> {
    try {
      data.releaseDate = parse(
        data.releaseDate as unknown as string,
        'dd-MM-yyyy',
        new Date(),
      );
      const product = await this.prisma.product.create({ data });
      return this.formatProduct(product);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw new CreationFailedException('Falha ao criar um novo produto!');
    }
  }

  async createMany(
    data: Prisma.ProductCreateInput[],
  ): Promise<FormattedProduct[]> {
    try {
      const createdProducts = await Promise.all(
        data.map(async (product) => {
          product.releaseDate = parse(
            product.releaseDate as unknown as string,
            'dd-MM-yyyy',
            new Date(),
          );
          const createdProduct = await this.prisma.product.create({
            data: product,
          });
          return this.formatProduct(createdProduct);
        }),
      );
      if (createdProducts.length === 0) {
        throw new CreationFailedException('Falha ao criar novos produtos!');
      }
      return createdProducts;
    } catch (error) {
      console.error('Erro ao criar produtos:', error);
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
