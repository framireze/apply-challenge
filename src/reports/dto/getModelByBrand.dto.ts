import { IsArray, IsOptional, IsString } from "class-validator";

export class GetModelsByBrandParamsDto {
  @IsOptional()
  @IsString()
  brands?: string;
}