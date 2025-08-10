import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { NonDeletedProductsParamsDto } from './dto/nonDeleteProducts-reports.dto';
import { GetModelsByBrandParamsDto } from './dto/getModelByBrand.dto';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  const mockReportsService = {
    getDeletedProductsReport: jest.fn(),
    getNonDeletedProductsPercentage: jest.fn(),
    getModelsByBrand: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDeletedProductsReport', () => {
    it('should return deleted products report from service', async () => {
      const mockResponse = { success: true, data: { totalProducts: 10 } };
      (service.getDeletedProductsReport as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.getDeletedProductsReport();

      expect(service.getDeletedProductsReport).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getNonDeletedPercentage', () => {
    it('should call service with given query params', async () => {
      const query: NonDeletedProductsParamsDto = {
        startDate: '2025-08-01',
        endDate: '2025-08-30',
        withPrice: 'true' as any,
      };
      const mockResponse = { success: true, data: {} };
      (service.getNonDeletedProductsPercentage as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.getNonDeletedPercentage(query);

      expect(service.getNonDeletedProductsPercentage).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getModelsByBrand', () => {
    it('should call service with given brands', async () => {
      const query: GetModelsByBrandParamsDto = { brands: 'apple,lg' };
      const mockResponse = { success: true, data: {} };
      (service.getModelsByBrand as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.getModelsByBrand(query);

      expect(service.getModelsByBrand).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });
  });
});
