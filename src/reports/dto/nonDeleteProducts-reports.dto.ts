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