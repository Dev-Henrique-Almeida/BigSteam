import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { parse, format } from 'date-fns';

export interface FormattedProduct {
  // Certifique-se de exportar a interface
  id: number;
  title: string;
  description: string;
  releaseDate: string;
  price: number;
  category: string;
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<FormattedProduct[]> {
    const products = await this.prisma.product.findMany();
    return products.map((product) => ({
      ...product,
      releaseDate: format(product.releaseDate, 'dd-MM-yyyy'),
    }));
  }

  async findOne(id: number): Promise<FormattedProduct> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    return {
      ...product,
      releaseDate: format(product.releaseDate, 'dd-MM-yyyy'),
    };
  }

  async create(data: Prisma.ProductCreateInput): Promise<FormattedProduct> {
    data.releaseDate = parse(
      data.releaseDate as unknown as string,
      'dd-MM-yyyy',
      new Date(),
    );
    const product = await this.prisma.product.create({ data });
    return {
      ...product,
      releaseDate: format(product.releaseDate, 'dd-MM-yyyy'),
    };
  }

  async update(
    id: number,
    data: Prisma.ProductUpdateInput,
  ): Promise<FormattedProduct> {
    if (data.releaseDate) {
      data.releaseDate = parse(
        data.releaseDate as unknown as string,
        'dd-MM-yyyy',
        new Date(),
      );
    }
    const product = await this.prisma.product.update({ where: { id }, data });
    return {
      ...product,
      releaseDate: format(product.releaseDate, 'dd-MM-yyyy'),
    };
  }

  async remove(id: number): Promise<FormattedProduct> {
    const product = await this.prisma.product.delete({ where: { id } });
    return {
      ...product,
      releaseDate: format(product.releaseDate, 'dd-MM-yyyy'),
    };
  }
}
