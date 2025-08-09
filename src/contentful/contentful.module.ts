import { Module } from '@nestjs/common';
import { ContentfulService } from './contentful.service';
import { ContentfulController } from './contentful.controller';
import { ConfigModule } from '@nestjs/config';
import { Product } from 'src/products/entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductsModule } from 'src/products/products.module';

@Module({
  controllers: [ContentfulController],
  providers: [ContentfulService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Product]),
    ScheduleModule.forRoot(),
    ProductsModule,
  ],
})
export class ContentfulModule {}
