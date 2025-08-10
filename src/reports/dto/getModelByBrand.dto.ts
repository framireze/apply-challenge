import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetModelsByBrandParamsDto {
  @IsOptional()
  @IsString()
  brands?: string;
}

// For swagger documentation

export class ModelsByBrandSimpleResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Models by brand' })
  message: string;

  @ApiProperty({
    description: 'Brand data with models and statistics',
    example: {
      asus: {
        brand: 'asus',
        models: ['QuietComfort 35', 'Surface Pro', 'Yoga Tab', 'HD 450BT'],
        minPrice: 53.12,
        maxPrice: 1730.1,
        averagePrice: 930.43,
        products: [
          {
            id: '9cddabd4-4031-45b3-b679-34afa9990c75',
            sku: 'HSO2RZI0',
            name: 'Asus QuietComfort 35',
            brand: 'Asus',
            model: 'QuietComfort 35',
            category: 'Headphones',
            color: 'Red',
            price: '346.01',
            currency: 'USD',
            stock: 69,
            isActive: true,
            deletedAt: null,
          },
        ],
      },
    },
  })
  data: Record<string, any>;
}
