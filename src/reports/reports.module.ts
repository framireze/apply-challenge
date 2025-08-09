import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ProductsModule } from 'src/products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService,
    JwtAuthGuard
  ],
  imports: [ProductsModule, TypeOrmModule.forFeature([Product])],
})
export class ReportsModule {}
