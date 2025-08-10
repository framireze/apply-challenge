import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { ProductsService } from 'src/products/products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { SelectQueryBuilder } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { BooleanString } from './dto/nonDeleteProducts-reports.dto';

const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'A',
    name: 'N1',
    brand: 'Apple',
    model: 'M1',
    category: 'Phone',
    color: 'Black',
    price: 100,
    currency: 'USD',
    stock: 5,
    isActive: true,
    contentfulRevision: 1,
    contentType: 'product',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    contentfulId: undefined,
    contentfulCreatedAt: undefined,
    contentfulUpdatedAt: undefined,
  } as any,
  {
    id: '2',
    sku: 'B',
    name: 'N2',
    brand: 'Apple',
    model: 'M2',
    category: 'Phone',
    color: 'Black',
    price: 200,
    currency: 'USD',
    stock: 3,
    isActive: false,
    contentfulRevision: 1,
    contentType: 'product',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
    contentfulId: undefined,
    contentfulCreatedAt: undefined,
    contentfulUpdatedAt: undefined,
  } as any,
  {
    id: '3',
    sku: 'C',
    name: 'N3',
    brand: 'LG',
    model: 'G1',
    category: 'TV',
    color: 'Gray',
    price: 0,
    currency: 'USD',
    stock: 10,
    isActive: true,
    contentfulRevision: 1,
    contentType: 'product',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    contentfulId: undefined,
    contentfulCreatedAt: undefined,
    contentfulUpdatedAt: undefined,
  } as any,
  {
    id: '4',
    sku: 'D',
    name: 'N4',
    brand: 'Asus',
    model: 'Z1',
    category: 'Laptop',
    color: 'Gray',
    price: 150,
    currency: 'USD',
    stock: 2,
    isActive: true,
    contentfulRevision: 1,
    contentType: 'product',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    contentfulId: undefined,
    contentfulCreatedAt: undefined,
    contentfulUpdatedAt: undefined,
  } as any,
];

const mockProductsService = {
  getAllProducts: jest.fn().mockResolvedValue(mockProducts),
};

const createQueryBuilderMock = () => {
  const qb: Partial<SelectQueryBuilder<Product>> & { getRawOne: jest.Mock } = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  } as any;
  return qb;
};

describe('ReportsService', () => {
  let service: ReportsService;
  let productsService: typeof mockProductsService;
  let qb: ReturnType<typeof createQueryBuilderMock>;

  beforeEach(async () => {
    qb = createQueryBuilderMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: ProductsService, useValue: mockProductsService },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(qb),
          },
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    productsService = module.get(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---- getDeletedProductsReport ----

  it('getDeletedProductsReport: calcula porcentaje de eliminados', async () => {
    // mockProducts tiene 4, de los cuales 1 tiene deletedAt != null
    const res = await service.getDeletedProductsReport();

    expect(productsService.getAllProducts).toHaveBeenCalled();
    expect(res.success).toBe(true);
    expect(res.data.totalProducts).toBe(4);
    expect(res.data.deletedProducts).toBe(1);
    expect(res.data.percentage).toBeCloseTo(25); // 1/4 * 100
  });

  it('getDeletedProductsReport: maneja errores con handleException', async () => {
    productsService.getAllProducts.mockRejectedValueOnce(new Error('DB error'));

    await expect(service.getDeletedProductsReport()).rejects.toThrow();
  });

  // ---- getNonDeletedProductsPercentage ----

  it('nonDeleted %: sin rango, sin filtro (ANY) usa total y suma no eliminados', async () => {
    qb.getRawOne.mockResolvedValue({
      total_products: 100,
      total_no_deleted: 60,
      no_deleted_with_price: 45,
      no_deleted_without_price: 15,
    });

    const res = await service.getNonDeletedProductsPercentage({
      startDate: undefined,
      endDate: undefined,
      withPrice: undefined, // ANY
    } as any);

    // no agrega BETWEEN
    expect(qb.andWhere).not.toHaveBeenCalledWith(
      expect.stringContaining('BETWEEN'),
      expect.any(Object),
    );

    expect(res.success).toBe(true);
    expect(res.data.totalProducts).toBe(100);
    expect(res.data.totalNoDeleted).toBe(60);
    // when ANY, tu servicio devuelve el % de noDeleted sobre total
    // (porque boleanPrice === undefined)
    expect(res.data.percentageNoDeleted.percentage).toBeCloseTo(60); // 60/100*100
    expect(res.data.percentageNoDeleted.withPrice).toBeUndefined();
  });

  it('nonDeleted %: con rango aplica BETWEEN en createdAt', async () => {
    qb.getRawOne.mockResolvedValue({
      total_products: 50,
      total_no_deleted: 20,
      no_deleted_with_price: 12,
      no_deleted_without_price: 8,
    });

    const res = await service.getNonDeletedProductsPercentage({
      startDate: '2025-08-01',
      endDate: '2025-08-30',
      withPrice: undefined,
    } as any);

    expect(qb.andWhere).toHaveBeenCalledWith(
      'p."createdAt" BETWEEN :from AND :to',
      expect.objectContaining({
        from: new Date('2025-08-01'),
        to: new Date('2025-08-30'),
      }),
    );

    expect(res.data.totalProducts).toBe(50);
    expect(res.data.percentageNoDeleted.percentage).toBeCloseTo(40); // 20/50*100
  });

  it('nonDeleted %: withPrice=true usa no_deleted_with_price/total', async () => {
    qb.getRawOne.mockResolvedValue({
      total_products: 80,
      total_no_deleted: 40,
      no_deleted_with_price: 30,
      no_deleted_without_price: 10,
    });

    const res = await service.getNonDeletedProductsPercentage({
      withPrice: BooleanString.TRUE, // 'true'
    } as any);

    expect(res.data.percentageNoDeleted.withPrice).toBe(true);
    expect(res.data.percentageNoDeleted.percentage).toBeCloseTo(37.5); // 30/80*100
  });

  it('nonDeleted %: withPrice=false usa no_deleted_without_price/total', async () => {
    qb.getRawOne.mockResolvedValue({
      total_products: 80,
      total_no_deleted: 40,
      no_deleted_with_price: 30,
      no_deleted_without_price: 10,
    });

    const res = await service.getNonDeletedProductsPercentage({
      withPrice: BooleanString.FALSE, // 'false'
    } as any);

    expect(res.data.percentageNoDeleted.withPrice).toBe(false);
    expect(res.data.percentageNoDeleted.percentage).toBeCloseTo(12.5); // 10/80*100
  });

  // ---- getModelsByBrand ----

  it('modelsByBrand: sin filtro de marcas agrupa por brand y calcula stats', async () => {
    const res = await service.getModelsByBrand({} as any);

    expect(productsService.getAllProducts).toHaveBeenCalledWith(true); // tu servicio lo llama con isActive = true
    expect(res.success).toBe(true);

    const data = res.data as Record<
      string,
      {
        models: Array<string | undefined>;
        minPrice: number;
        maxPrice: number;
        averagePrice: number;
        products: unknown[];
      }
    >;
    // Apple
    const apple = data['apple'];
    expect(apple).toBeDefined();
    const appleModels = apple.models
      .filter((m): m is string => typeof m === 'string')
      .slice()
      .sort();
    expect(appleModels).toEqual(['M1', 'M2'].sort());
    expect(apple.minPrice).toBe(100);
    expect(apple.maxPrice).toBe(200);
    expect(data['apple'].averagePrice).toBe(150);

    // lg
    expect(data['lg'].minPrice).toBe(0);
    expect(data['lg'].maxPrice).toBe(0);
    expect(data['lg'].averagePrice).toBe(0);

    // asus
    expect(data['asus'].minPrice).toBe(150);
    expect(data['asus'].averagePrice).toBe(150);
  });

  it('modelsByBrand: con filtro brands=apple,lg solo devuelve esas marcas', async () => {
    const res = await service.getModelsByBrand({ brands: 'apple,lg' } as any);
    const data = res.data as Record<string, any>;

    expect(data['apple']).toBeDefined();
    expect(data['lg']).toBeDefined();
    expect(data['asus']).toBeUndefined();
  });

  // ---- handleException (indirectamente ya lo cubrimos en getDeletedProductsReport error) ----

  it('handleException: QueryFailedError -> BadRequestException (vía público)', async () => {
    const boom = new Error('boom');
    boom.name = 'QueryFailedError';
    qb.getRawOne.mockRejectedValueOnce(boom);

    await expect(service.getNonDeletedProductsPercentage({})).rejects.toThrow(
      BadRequestException,
    );
  });
});
