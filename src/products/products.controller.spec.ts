import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { GetProductsQueryDto } from './dto/get-products-query.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockService = {
    getProducts: jest.fn(),
    deleteProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockService }],
    }).compile();

    controller = module.get(ProductsController);
    service = module.get(ProductsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('getProducts: delega al servicio con los query params', async () => {
    const query: GetProductsQueryDto = {
      name: 'apple',
      brand: 'Apple',
      category: 'Smartwatch',
      minPrice: 100,
      maxPrice: 300,
      model: 'M1',
      page: 1,
      limit: 5,
    } as any;

    const mockResponse = {
      success: true,
      data: [],
      total: 0,
      page: 1,
      limit: 5,
      message: 'ok',
    };
    (service.getProducts as jest.Mock).mockResolvedValue(mockResponse);

    const res = await controller.getProducts(query);
    expect(service.getProducts).toHaveBeenCalledWith(query);
    expect(res).toEqual(mockResponse);
  });

  it('deleteProduct: delega con sku y retorna respuesta del servicio', async () => {
    (service.deleteProduct as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Product deleted successfully',
    });

    const res = await controller.deleteProduct('A1');
    expect(service.deleteProduct).toHaveBeenCalledWith('A1');
    expect(res).toEqual({
      success: true,
      message: 'Product deleted successfully',
    });
  });
});
