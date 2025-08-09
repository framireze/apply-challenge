import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { NonDeletedProductsParamsDto } from './dto/nonDeleteProducts-reports.dto';
import { GetModelsByBrandParamsDto } from './dto/getModelByBrand.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('deleted-percentage')
  getDeletedProductsReport() {
    return this.reportsService.getDeletedProductsReport();
  }

  @Get('non-deleted-percentage')
  getNonDeletedPercentage(@Query(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: false
      },
    })
  ) 
    q: NonDeletedProductsParamsDto) {
    return this.reportsService.getNonDeletedProductsPercentage(q);
  }

  @Get('models')
  getModelsByBrand(@Query() q: GetModelsByBrandParamsDto) {
    return this.reportsService.getModelsByBrand(q);
  }
}
