import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ContentfulService } from './contentful.service';
import { ProductsService } from 'src/products/products.service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ContentfulService', () => {
  let service: ContentfulService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        CONTENTFUL_SPACE_ID: 'test-space-id',
        CONTENTFUL_ACCESS_TOKEN: 'test-access-token',
        CONTENTFUL_ENVIRONMENT: 'master',
        CONTENTFUL_CONTENT_TYPE: 'product',
      };
      return config[key];
    }),
  };

  const mockProductsService = {
    processProducts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentfulService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    service = module.get<ContentfulService>(ContentfulService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(service).toBeDefined();
      expect(configService.get).toHaveBeenCalledWith('CONTENTFUL_SPACE_ID');
      expect(configService.get).toHaveBeenCalledWith('CONTENTFUL_ACCESS_TOKEN');
      expect(configService.get).toHaveBeenCalledWith('CONTENTFUL_ENVIRONMENT');
      expect(configService.get).toHaveBeenCalledWith('CONTENTFUL_CONTENT_TYPE');
    });
  });

  describe('syncProducts', () => {
    const mockContentfulResponse = {
      data: {
        items: [
          {
            sys: {
              id: '1',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
              revision: 1,
            },
            fields: {
              sku: 'TEST123',
              name: 'Test Product',
              brand: 'Test Brand',
              category: 'Electronics',
              price: 99.99,
              currency: 'USD',
              stock: 10,
            },
          },
        ],
      },
    };

    const mockProcessResults = {
      created: 1,
      updated: 0,
      notAffected: 0,
      skuAffected: ['TEST123'],
    };

    it('should sync products successfully', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue(mockContentfulResponse);
      mockProductsService.processProducts.mockResolvedValue(mockProcessResults);

      // Act
      const result = await service.syncProducts();

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockProductsService.processProducts).toHaveBeenCalledWith(
        mockContentfulResponse.data.items,
      );
      expect(result).toEqual(mockProcessResults);
    });

    it('should handle axios error during fetch', async () => {
      // Arrange
      const axiosError = new Error('Network error');
      mockedAxios.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(service.syncProducts()).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockProductsService.processProducts).not.toHaveBeenCalled();
    });

    it('should handle products service error', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue(mockContentfulResponse);
      const serviceError = new Error('Database error');
      serviceError.name = 'QueryFailedError';
      mockProductsService.processProducts.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(service.syncProducts()).rejects.toThrow(BadRequestException);
      expect(mockProductsService.processProducts).toHaveBeenCalledWith(
        mockContentfulResponse.data.items,
      );
    });

    it('should log successful sync', async () => {
      // Arrange
      const loggerSpy = jest.spyOn(service['logger'], 'log');
      mockedAxios.get.mockResolvedValue(mockContentfulResponse);
      mockProductsService.processProducts.mockResolvedValue(mockProcessResults);

      // Act
      await service.syncProducts();

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith('Starting sync...');
      expect(loggerSpy).toHaveBeenCalledWith(
        '📦 Fetched 1 products from Contentful',
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        'Sync completed: 1 created, 0 updated, 0 not affected, 1 sku affected',
      );
    });

    it('should log error on sync failure', async () => {
      // Arrange
      const loggerSpy = jest.spyOn(service['logger'], 'error');
      const error = new Error('Test error');
      mockedAxios.get.mockRejectedValue(error);

      // Act & Assert
      await expect(service.syncProducts()).rejects.toThrow();
      expect(loggerSpy).toHaveBeenCalledWith(
        'Contentful API error:',
        'Test error',
      );
    });
  });

  describe('handleException', () => {
    it('should throw NotFoundException as is', () => {
      // Arrange
      const notFoundError = new NotFoundException('Not found');

      // Act & Assert
      expect(() => service['handleException'](notFoundError)).toThrow(
        NotFoundException,
      );
    });

    it('should transform QueryFailedError to BadRequestException', () => {
      // Arrange
      const queryError = new Error('Query failed');
      queryError.name = 'QueryFailedError';

      // Act & Assert
      expect(() => service['handleException'](queryError)).toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException as is', () => {
      // Arrange
      const conflictError = new ConflictException('Conflict');

      // Act & Assert
      expect(() => service['handleException'](conflictError)).toThrow(
        ConflictException,
      );
    });

    it('should throw UnauthorizedException as is', () => {
      // Arrange
      const authError = new UnauthorizedException('Unauthorized');

      // Act & Assert
      expect(() => service['handleException'](authError)).toThrow(
        UnauthorizedException,
      );
    });

    it('should transform unknown error to InternalServerErrorException', () => {
      // Arrange
      const unknownError = new Error('Unknown error');

      // Act & Assert
      expect(() => service['handleException'](unknownError)).toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('fetchContentfulProducts (private method test via syncProducts)', () => {
    it('should fetch products with correct URL', async () => {
      // Arrange
      const mockResponse = { data: { items: [] } };
      mockedAxios.get.mockResolvedValue(mockResponse);
      mockProductsService.processProducts.mockResolvedValue({
        created: 0,
        updated: 0,
        notAffected: 0,
        skuAffected: [],
      });

      // Act
      await service.syncProducts();

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://cdn.contentful.com/spaces/test-space-id/environments/master/entries?access_token=test-access-token&content_type=product',
      );
    });

    it('should handle empty products response', async () => {
      // Arrange
      const mockResponse = { data: { items: [] } };
      mockedAxios.get.mockResolvedValue(mockResponse);
      mockProductsService.processProducts.mockResolvedValue({
        created: 0,
        updated: 0,
        notAffected: 0,
        skuAffected: [],
      });

      // Act
      const result = await service.syncProducts();

      // Assert
      expect(result.created).toBe(0);
      expect(mockProductsService.processProducts).toHaveBeenCalledWith([]);
    });
  });
});
