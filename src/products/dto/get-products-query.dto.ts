import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class GetProductsQueryDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @IsNumber()
  minPrice: number;

  @IsOptional()
  @IsNumber()
  maxPrice: number;

  @Type(() => Number)
  @IsInt() @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt() @Min(1) @Max(5)
  limit: number = 5;
}

export class ProductDoc {
  @ApiProperty({
    description: 'Product unique identifier',
    example: 'cb18fc85-4a54-45b3-9933-529122319766',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({
    description: 'Product SKU (unique)',
    example: 'DJY7NF1T'
  })
  sku: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Acer Elite 85h'
  })
  name: string;

  @ApiProperty({
    description: 'Product brand',
    example: 'Acer'
  })
  brand: string;

  @ApiProperty({
    description: 'Product model',
    example: 'Elite 85h'
  })
  model: string;

  @ApiProperty({
    description: 'Product category',
    example: 'Headphones'
  })
  category: string;

  @ApiProperty({
    description: 'Product color',
    example: 'White'
  })
  color: string;

  @ApiProperty({
    description: 'Product price as string',
    example: '896.31'
  })
  price: string;

  @ApiProperty({
    description: 'Price currency',
    example: 'USD'
  })
  currency: string;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 196
  })
  stock: number;

  @ApiProperty({
    description: 'Product active status',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Contentful revision number',
    example: 1
  })
  contentfulRevision: number;

  @ApiProperty({
    description: 'Contentful content type',
    example: 'product'
  })
  contentType: string;
}

export class GetProductsResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Products fetched successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Total number of products available',
    example: 98
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 5
  })
  limit: number;

  @ApiProperty({
    description: 'Array of products',
    type: [ProductDoc],
    example: [
      {
        id: 'cb18fc85-4a54-45b3-9933-529122319766',
        sku: 'DJY7NF1T',
        name: 'Acer Elite 85h',
        brand: 'Acer',
        model: 'Elite 85h',
        category: 'Headphones',
        color: 'White',
        price: '896.31',
        currency: 'USD',
        stock: 196,
        isActive: true,
        contentfulRevision: 1,
        contentType: 'product'
      }
    ]
  })
  data: ProductDoc[];
}