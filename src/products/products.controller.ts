import { Controller, Get, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { GetProductsQueryDto, GetProductsResponseDto } from './dto/get-products-query.dto';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('product')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
    
  @ApiOperation({ summary: 'Get products', description: `
    Retrieve a paginated list of active products with optional filtering.
    
    *Pagination:*
    - Maximum 5 items per page (as per challenge requirements)
    - Use \`page\` and \`limit\` parameters
    
    *Filtering:*
    - Filter by name (partial search)
    - Filter by exact category, brand, model
    - Filter by price range using minPrice and maxPrice
  ` })
  @ApiQuery({ name: 'name', type: String, required: false })
  @ApiQuery({ name: 'brand', type: String, required: false })
  @ApiQuery({ name: 'model', type: String, required: false })
  @ApiQuery({ name: 'category', type: String, required: false })
  @ApiQuery({ name: 'minPrice', type: Number, required: false })
  @ApiQuery({ name: 'maxPrice', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @Get()
  @ApiOkResponse({ type: GetProductsResponseDto })
  getProducts(@Query() query: GetProductsQueryDto) {
    return this.productsService.getProducts(query);
  }

  @Delete(':sku')
  @ApiOperation({ 
    summary: 'Delete product by SKU',
    description: 'Soft delete a product using its SKU. The product will NOT reappear after Contentful sync.'
  })
  @ApiParam({ 
    name: 'sku', 
    description: 'Product SKU',
    example: 'DJY7NF1T'
  })
  @ApiOkResponse({
    description: '✅ Product deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true
        },
        message: {
          type: 'string',
          example: 'Product deleted successfully'
        }
      },
      example: {
        success: true,
        message: 'Product deleted successfully'
      }
    }
  })
  @ApiNotFoundResponse({
    description: '❌ Product not found',
    schema: {
      example: {
        success: false,
        message: 'Product not found',
      }
    }
  })
  deleteProduct(@Param('sku') sku: string) {
    return this.productsService.deleteProduct(sku);
  }
}
