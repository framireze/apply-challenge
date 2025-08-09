import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContentfulProductItem, ContentfulProductResponse } from './interfaces/contentful-response.interface';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class ContentfulService {
  private readonly logger = new Logger(ContentfulService.name);
  private readonly contentfulApiUrl: string;
  private readonly spaceId: string;
  private readonly accessToken: string;
  private readonly environment: string;
  private readonly contentType: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService
  ) {
    this.spaceId = this.configService.get<string>('CONTENTFUL_SPACE_ID')!;
    this.accessToken = this.configService.get<string>('CONTENTFUL_ACCESS_TOKEN')!;
    this.environment = this.configService.get<string>('CONTENTFUL_ENVIRONMENT')!;
    this.contentType = this.configService.get<string>('CONTENTFUL_CONTENT_TYPE')!;
    this.contentfulApiUrl = `https://cdn.contentful.com/spaces/${this.spaceId}/environments/${this.environment}/entries?access_token=${this.accessToken}&content_type=${this.contentType}`;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncProducts(): Promise<any> {
    this.logger.log('Starting sync...');

    try {
      const products = await this.fetchContentfulProducts();
      const results = await this.productsService.processProducts(products);
      this.logger.log(`Sync completed: ${results.created} created, ${results.updated} updated, ${results.notAffected} not affected, ${results.skuAffected.length} sku affected`);
      return results;
    } catch (error) {
      this.logger.error('Sync failed:', error.message);
      this.handleException(error);
    }
  }

  private async fetchContentfulProducts(): Promise<ContentfulProductItem[]> {
    try {
      const response = await axios.get<ContentfulProductResponse>(`${this.contentfulApiUrl}`);

      this.logger.log(`📦 Fetched ${response.data.items.length} products from Contentful`);
      return response.data.items;

    } catch (error) {
      this.logger.error('Contentful API error:', error.message);
      this.handleException(error);
    }
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
