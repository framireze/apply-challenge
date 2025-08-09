import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    sku: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    brand: string;

    @IsString()
    @IsOptional()
    model?: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsOptional()
    color?: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsNumber()
    stock: number;

    @IsString()
    @IsNotEmpty()
    contentfulId: string;

    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;

    @IsDate()
    @IsOptional()
    contentfulCreatedAt?: Date;

    @IsDate()
    @IsOptional()
    contentfulUpdatedAt?: Date;

    @IsNumber()
    @IsOptional()
    contentfulRevision?: number;

    @IsDate()
    @IsOptional()
    deletedAt?: Date;
}