import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum BooleanString {
  TRUE = 'true',
  FALSE = 'false',
}
export class NonDeletedProductsParamsDto {
  @IsOptional()
  @IsDateString()
  startDate: string; // ISO: '2025-08-01T00:00:00Z'

  @IsOptional()
  @IsDateString()
  endDate: string;   // ISO

  @IsOptional()
  @IsEnum(BooleanString)
  withPrice?: BooleanString;
}

export class NonDeletedProductsResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Percentage of non-deleted products'
  })
  message: string;

  @ApiProperty({
    description: 'Report data',
    example: {
      scope: {
        startDate: '2025-08-08',
        endDate: '2025-08-09'
      },
      totalProducts: 100,
      totalNoDeleted: 97,
      percentageNoDeleted: {
        withPrice: true,
        percentage: 97
      }
    }
  })
  data: {
    scope: {
      startDate: string;
      endDate: string;
    };
    totalProducts: number;
    totalNoDeleted: number;
    percentageNoDeleted: {
      withPrice: boolean;
      percentage: number;
    };
  };
}