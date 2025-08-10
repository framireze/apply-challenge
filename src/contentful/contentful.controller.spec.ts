import { Test, TestingModule } from '@nestjs/testing';
import { ContentfulController } from './contentful.controller';
import { ContentfulService } from './contentful.service';

describe('ContentfulController', () => {
  let controller: ContentfulController;
  let service: ContentfulService;

  const mockContentfulService = {
    syncProducts: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentfulController],
      providers: [
        { provide: ContentfulService, useValue: mockContentfulService }
      ],
    }).compile();

    controller = module.get<ContentfulController>(ContentfulController);
    service = module.get<ContentfulService>(ContentfulService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('syncProducts', () => {
    it('should call service syncProducts method', async () => {
      // Arrange
      const expectedResult = { 
        created: 5, 
        updated: 2, 
        notAffected: 10, 
        skuAffected: ['SKU1', 'SKU2'] 
      };
      mockContentfulService.syncProducts.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.syncProducts();

      // Assert
      expect(service.syncProducts).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Service error');
      mockContentfulService.syncProducts.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.syncProducts()).rejects.toThrow('Service error');
      expect(service.syncProducts).toHaveBeenCalledTimes(1);
    });
  });
});