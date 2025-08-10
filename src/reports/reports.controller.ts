import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { NonDeletedProductsParamsDto, NonDeletedProductsResponseDto } from './dto/nonDeleteProducts-reports.dto';
import { GetModelsByBrandParamsDto, ModelsByBrandSimpleResponseDto } from './dto/getModelByBrand.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiUnauthorizedResponse } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('deleted-percentage')
  @ApiOperation({ 
    summary: 'Get percentage of deleted products',
    description: `
      Returns statistics about deleted vs active products.
      
      **Report includes:**
      - Total number of products (including deleted)
      - Number of deleted products
      - Percentage of deleted products
      
      **Note:** This endpoint requires JWT authentication.
    `
  })
  @ApiBearerAuth('JWT-auth') // 🔐 Requiere autenticación JWT
  @ApiOkResponse({
    description: '✅ Deleted products report generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          description: 'Operation success status',
          example: true
        },
        message: {
          type: 'string',
          description: 'Success message',
          example: 'Deleted products report'
        },
        data: {
          type: 'object',
          description: 'Report data',
          properties: {
            totalProducts: {
              type: 'number',
              description: 'Total number of products (including deleted)',
              example: 100
            },
            deletedProducts: {
              type: 'number',
              description: 'Number of deleted products',
              example: 3
            },
            percentage: {
              type: 'number',
              description: 'Percentage of deleted products',
              example: 3
            }
          }
        }
      },
      example: {
        success: true,
        message: 'Deleted products report',
        data: {
          totalProducts: 100,
          deletedProducts: 3,
          percentage: 3
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: '❌ JWT token required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized'
      }
    }
  })
  getDeletedProductsReport() {
    return this.reportsService.getDeletedProductsReport();
  }

  @Get('non-deleted-percentage')
  @ApiOperation({ 
    summary: 'Get percentage of non-deleted products',
    description: `
      Returns statistics about non-deleted products with optional filtering.
      
      **Query Parameters:**
      - **startDate/endDate:** Filter products created within date range
      - **withPrice:** Filter products that have price ('true') or don't have price ('false')
      
      **Report includes:**
      - Date scope used for filtering
      - Total products count
      - Non-deleted products count
      - Percentage with/without price filter
      
      **Examples:**
      - \`?startDate=2025-08-08&endDate=2025-08-09\` - Products in date range
      - \`?withPrice=true\` - Products that have a price
      - \`?withPrice=false\` - Products without price
      
      **Note:** This endpoint requires JWT authentication.
    `
  })
  @ApiBearerAuth('JWT-auth') 
  @ApiOkResponse({ description: '✅ Non-deleted products report generated successfully', type: NonDeletedProductsResponseDto })
  @ApiBadRequestResponse({
    description: '❌ Invalid query parameters',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'startDate must be a valid ISO 8601 date string',
          'endDate must be a valid ISO 8601 date string',
          'withPrice must be one of the following values: true, false'
        ],
        error: 'Bad Request'
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: '❌ JWT token required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      }
    }
  })
  @ApiQuery({ name: 'startDate', type: String, required: false, description: 'Filter products created within date range' })
  @ApiQuery({ name: 'endDate', type: String, required: false, description: 'Filter products created within date range' })
  @ApiQuery({ name: 'withPrice', type: String, required: false, description: 'Filter products that have price (\'true\') or don\'t have price (\'false\')' })
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
  @ApiOperation({ 
    summary: 'Get models grouped by brand',
    description: `
      Returns detailed information about product models grouped by brand.
      
      **Query Parameters:**
      - **brands:** Comma-separated list of brands to filter by
      
      **For each brand, returns:**
      - List of unique models
      - Price statistics (min, max, average)
      - Complete product details
      
      **Examples:**
      - \`?brands=asus,lg\` - Only Asus and LG products
      - \`?brands=apple\` - Only Apple products
      - No parameters - All brands
      
      **Note:** This endpoint requires JWT authentication.
    `
  })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: '✅ Models by brand report generated successfully',
    type: ModelsByBrandSimpleResponseDto 
  })
  @ApiBadRequestResponse({
    description: '❌ Invalid query parameters',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid brand names provided',
        error: 'Bad Request'
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: '❌ JWT token required'
  })
  @ApiQuery({ name: 'brands', type: String, required: false, description: 'Comma-separated list of brands to filter by' })
  getModelsByBrand(@Query() q: GetModelsByBrandParamsDto) {
    return this.reportsService.getModelsByBrand(q);
  }
}
