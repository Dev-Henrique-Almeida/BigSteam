import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { FormattedProduct } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(): Promise<FormattedProduct[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<FormattedProduct> {
    return this.productsService.findOne(Number(id));
  }

  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<FormattedProduct> {
    return this.productsService.create(createProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<FormattedProduct> {
    return this.productsService.remove(Number(id));
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<FormattedProduct> {
    return this.productsService.update(Number(id), updateProductDto);
  }
}

export default ProductsController; // Adicione essa linha
