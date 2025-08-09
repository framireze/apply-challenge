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