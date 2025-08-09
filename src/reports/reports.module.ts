import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ProductsModule } from 'src/products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [ProductsModule, TypeOrmModule.forFeature([Product])],
})
export class ReportsModule {}
