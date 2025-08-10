import { Controller, Get } from '@nestjs/common';
import { ContentfulService } from './contentful.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('contentful')
export class ContentfulController {
  constructor(private readonly contentfulService: ContentfulService) {}

  @Get()
  @ApiOperation({ summary: 'Sync products from Contentful', description: 'Sync products from Contentful if you don\'t want to wait for the automatic sync' })
  @ApiResponse({ status: 200, description: 'Products synced successfully' })
  syncProducts() {
    return this.contentfulService.syncProducts();
  }
}
