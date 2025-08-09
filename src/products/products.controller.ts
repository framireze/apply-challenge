import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';

@Controller('product')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getProducts(@Query() query: GetProductsQueryDto) {
    return this.productsService.getProducts(query);
  }

  @Delete(':sku')
  deleteProduct(@Param('sku') sku: string) {
    return this.productsService.deleteProduct(sku);
  }
}
