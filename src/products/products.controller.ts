import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { Public } from 'src/auth/decorators/public.decorator';

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
