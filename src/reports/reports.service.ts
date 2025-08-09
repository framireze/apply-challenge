import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { BooleanString, NonDeletedProductsParamsDto } from './dto/nonDeleteProducts-reports.dto';
import { GetModelsByBrandParamsDto } from './dto/getModelByBrand.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {

  }

  async getDeletedProductsReport() {
    try {
      const products = await this.productsService.getAllProducts();
      console.log(products.length);
      const deletedProducts = products.filter(product => {
        if (product.deletedAt) {
          return product;
        }
      });
      console.log(deletedProducts);
      const percentage = Number(((deletedProducts.length / products.length) * 100).toFixed(2));
      return {
        success: true,
        message: 'Deleted products report',
        data: {
          totalProducts: products.length,
          deletedProducts: deletedProducts.length,
          percentage
        }
      };
    } catch (error) {
      this.handleException(error);
    }
  }

  async getNonDeletedProductsPercentage(params: NonDeletedProductsParamsDto) {
    const { startDate, endDate, withPrice } = params;
    console.log("withPrice", withPrice);
    const qb = this.productRepo
      .createQueryBuilder('p')
      .select([
        'COUNT(*)::int AS total_products',
        'SUM(CASE WHEN p."isActive" = true THEN 1 ELSE 0 END)::int AS total_no_deleted',
        'SUM(CASE WHEN p."isActive" = true AND p."price" > 0 THEN 1 ELSE 0 END)::int AS no_deleted_with_price',
        'SUM(CASE WHEN p."isActive" = true AND p."price" = 0 THEN 1 ELSE 0 END)::int AS no_deleted_without_price',
      ]);

    if (startDate && endDate) {
      qb.andWhere('p."createdAt" BETWEEN :from AND :to', {
        from: new Date(startDate),
        to: new Date(endDate),
      });
    }

    const raw = await qb.getRawOne<{
      total_products: number;
      total_no_deleted: number;
      no_deleted_with_price: number;
      no_deleted_without_price: number;
    }>();
    console.log(raw);
    const total = Number(raw?.total_products ?? 0);
    const withP = Number(raw?.no_deleted_with_price ?? 0);
    const withoutP = Number(raw?.no_deleted_without_price ?? 0);
    const noDeleted = Number(raw?.total_no_deleted ?? 0);

    let percentageResult: number;

    let boleanPrice = withPrice === BooleanString.TRUE ? true : withPrice === BooleanString.FALSE ? false : undefined;
    if (boleanPrice == undefined) {
      percentageResult = Number((noDeleted / total * 100).toFixed(2));
    } else if (boleanPrice) {
      percentageResult = Number((withP / total * 100).toFixed(2));
    } else {
      percentageResult = Number((withoutP / total * 100).toFixed(2));
    }

    return {
      success: true,
      message: 'Percentage of non-deleted products',
      data: {
        scope: { startDate, endDate },
        totalProducts: total,          // total (en el rango si se envía)
        totalNoDeleted: noDeleted,
        percentageNoDeleted: {
          withPrice: boleanPrice,
          percentage: percentageResult
        }
      },
    };
  }

  async getModelsByBrand(params: GetModelsByBrandParamsDto) {
    try {
      const { brands } = params;
      let isActive = true;
      let brandsArray = brands ? brands.split(',').map(brand => brand.trim().toLowerCase()) : [];
      let products = await this.productsService.getAllProducts(isActive);
      if (brandsArray && brandsArray.length > 0) products = products.filter(product => brandsArray.includes(product.brand.toLowerCase()));
      let result = products.reduce((acc, product) => {
        let brand = product.brand.toLowerCase();
        if (!acc[brand]) {
          acc[brand] = {
            brand: brand,
            models: [product.model],
            minPrice: product.price,
            maxPrice: product.price,
            averagePrice: product.price,
            products: [product],
          }
        }else{
          if (!acc[brand].models.includes(product.model)) {
            acc[brand].models.push(product.model);
          }
          acc[brand].products.push(product);
          acc[brand].minPrice = Math.min(acc[brand].minPrice, product.price);
          acc[brand].maxPrice = Math.max(acc[brand].maxPrice, product.price);
          acc[brand].averagePrice = this.getAveragePrice(acc[brand].products);
        }
        return acc;
      }, {});
      
      return {
        success: true,
        message: 'Models by brand',
        data: result
      };
    } catch (error) {
      this.handleException(error);
    }
  }

  private getAveragePrice(products: Product[]) {
    let sum = products.reduce((sum, product) => sum + Number(product.price), 0);
    console.log("sum", sum);
    let average = sum / products.length;
    return Number(average.toFixed(2));
  }

  private handleException(error: Error): never {
    this.logger.error(error.message, error.stack);
    if (error instanceof NotFoundException) {
      throw error;
    } else if (error.name === 'QueryFailedError') {
      throw new BadRequestException({ success: false, message: error.message });
    } else if (error instanceof ConflictException) {
      throw new ConflictException({ success: false, message: error.message })
    } else if (error instanceof UnauthorizedException) {
      throw new UnauthorizedException({ success: false, message: error.message })
    } else {
      throw new InternalServerErrorException({
        success: false,
        message: 'An error occurred',
      });
    }
  }
}
