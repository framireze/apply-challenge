import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { GetProductsQueryDto } from './dto/get-products-query.dto';

type MockRepo<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

// ---- Factory primero (para no usarla antes de declararla)
const contentfulItem = (over: Partial<any> = {}) => ({
  sys: {
    id: 'CF1',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-02T00:00:00Z',
    revision: 2,
    contentType: { sys: { id: 'product' } },
  },
  fields: {
    sku: 'NEW-1',
    name: 'New Gadget',
    brand: 'BrandX',
    model: 'ModelX',
    category: 'Gadgets',
    color: 'Red',
    price: 123.45,
    currency: 'USD',
    stock: 7,
    ...over,
  },
});

const productRows: Product[] = [
  {
    id: '1',
    sku: 'A1',
    name: 'Apple Watch',
    brand: 'Apple',
    model: 'M1',
    category: 'Smartwatch',
    color: 'Black',
    price: 199.99 as any,
    currency: 'USD',
    stock: 10,
    isActive: true,
    deletedAt: null,
    contentType: 'product',
  } as any,
  {
    id: '2',
    sku: 'B1',
    name: 'Asus Laptop',
    brand: 'Asus',
    model: 'Z1',
    category: 'Laptop',
    color: 'Gray',
    price: 999.0 as any,
    currency: 'USD',
    stock: 5,
    isActive: true,
    deletedAt: null,
    contentType: 'product',
  } as any,
  {
    id: '3',
    sku: 'C1',
    name: 'LG TV',
    brand: 'LG',
    model: 'G1',
    category: 'TV',
    color: 'Gray',
    price: 0 as any,
    currency: 'USD',
    stock: 2,
    isActive: true,
    deletedAt: null,
    contentType: 'product',
  } as any,
  {
    id: '4',
    sku: 'X1',
    name: 'Old Phone',
    brand: 'Nokia',
    model: '3310',
    category: 'Phone',
    color: 'Blue',
    price: 49.99 as any,
    currency: 'USD',
    stock: 0,
    isActive: false,
    deletedAt: new Date(),
    contentType: 'product',
  } as any,
];

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: MockRepo<Product>;

  beforeEach(async () => {
    const repoMock: MockRepo<Product> = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: repoMock },
      ],
    }).compile();

    service = module.get(ProductsService);
    repo = module.get(getRepositoryToken(Product));
  });

  afterEach(() => jest.clearAllMocks());

  // -------- getProducts --------
  it('getProducts: aplica filtros + orden + paginación (solo activos)', async () => {
    (repo.find as jest.Mock).mockResolvedValue(productRows);

    const query: GetProductsQueryDto = {
      name: 'a',
      minPrice: 100,
      maxPrice: 1000,
      page: 1,
      limit: 2,
    } as any;

    const res = await service.getProducts(query);

    expect(repo.find).toHaveBeenCalledWith({ where: { isActive: true } });
    expect(res.total).toBe(2); // Apple Watch (199.99), Asus Laptop (999)
    expect(res.data.length).toBe(2);
    expect(res.data[0].name <= res.data[1].name).toBe(true);
  });

  it('getProducts: filtra por category/brand/model y rango de precio', async () => {
    (repo.find as jest.Mock).mockResolvedValue(productRows);

    const res = await service.getProducts({
      page: 1,
      limit: 10,
      category: 'Laptop',
      brand: 'Asus',
      model: 'Z1',
      minPrice: 900,
      maxPrice: 1000,
    } as any);

    expect(res.total).toBe(1);
    expect(res.data[0].sku).toBe('B1');
  });

  // -------- getAllProducts --------
  it('getAllProducts: trae todos y filtra por isActive si se pasa el flag', async () => {
    (repo.find as jest.Mock).mockResolvedValue(productRows);

    const all = await service.getAllProducts();
    expect(all.length).toBe(4); // incluye el inactivo si tu dataset lo tuviera

    const onlyActive = await service.getAllProducts(true);
    expect(onlyActive.every((p) => p.isActive)).toBe(true);

    const onlyInactive = await service.getAllProducts(false);
    expect(onlyInactive.every((p) => !p.isActive)).toBe(true);
  });

  // -------- create --------
  it('create: usa create + save', async () => {
    const dto = {
      sku: 'NEW',
      name: 'New',
      brand: 'B',
      category: 'C',
      price: 10,
      currency: 'USD',
      stock: 1,
      contentfulId: 'X',
      isActive: true,
    } as any;

    (repo.create as jest.Mock).mockReturnValue(dto);
    (repo.save as jest.Mock).mockResolvedValue({ id: 'ID1', ...dto });

    const res = await service.create(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(dto);
    expect(res.id).toBe('ID1');
  });

  it('create: transforma QueryFailedError a BadRequestException', async () => {
    const dto: any = { sku: 'DUP' };
    (repo.create as jest.Mock).mockReturnValue(dto);
    const err = new Error('dup');
    err.name = 'QueryFailedError';
    (repo.save as jest.Mock).mockRejectedValue(err);

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  // -------- updateProduct --------
  it('updateProduct: NotFound si no existe', async () => {
    (repo.findOne as jest.Mock).mockResolvedValueOnce(null);
    await expect(
      service.updateProduct('NOPE', { name: 'x' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('updateProduct: mergea y guarda', async () => {
    const db = { sku: 'A1', name: 'Apple Watch', brand: 'Apple' } as any;
    (repo.findOne as jest.Mock).mockResolvedValue(db);
    (repo.save as jest.Mock).mockResolvedValue({ ...db, name: 'New Name' });

    const res = await service.updateProduct('A1', { name: 'New Name' });
    expect(repo.save).toHaveBeenCalledWith({ ...db, name: 'New Name' });
    expect(res.name).toBe('New Name');
  });

  // -------- deleteProduct --------
  it('deleteProduct: NotFound si no existe', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue(null);
    await expect(service.deleteProduct('NOPE')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deleteProduct: marca isActive=false y setea deletedAt', async () => {
    const db: any = { sku: 'A1', isActive: true, deletedAt: null };
    (repo.findOne as jest.Mock).mockResolvedValue(db);
    (repo.save as jest.Mock).mockResolvedValue({
      ...db,
      isActive: false,
      deletedAt: new Date(),
    });

    const res = await service.deleteProduct('A1');
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false }),
    );
    expect(res).toEqual({
      success: true,
      message: 'Product deleted successfully',
    });
  });

  // -------- processProducts --------
  it('processProducts: crea cuando no existe, actualiza si cambió, cuenta notAffected', async () => {
    const incoming = [
      // no existe -> create
      contentfulItem({
        sku: 'NEW-1',
        name: 'New Gadget',
        brand: 'BrandX',
        model: 'ModelX',
        category: 'Gadgets',
        color: 'Red',
        price: 123.45,
        currency: 'USD',
        stock: 7,
        contentType: 'product',
      }),
      // existe y es IGUAL -> notAffected (match TOTAL con productRows[0])
      contentfulItem({
        sku: 'A1',
        name: 'Apple Watch',
        brand: 'Apple',
        model: 'M1',
        category: 'Smartwatch',
        color: 'Black',
        price: 199.99,
        currency: 'USD',
        stock: 10,
        contentType: 'product',
      }),
      // existe y CAMBIÓ -> updated (solo name distinto vs productRows[1])
      contentfulItem({
        sku: 'B1',
        name: 'Asus Laptop v2',
        brand: 'Asus',
        model: 'Z1',
        category: 'Laptop',
        color: 'Gray',
        price: 999.0,
        currency: 'USD',
        stock: 5,
        contentType: 'product',
      }),
    ];

    (repo.findOne as jest.Mock)
      .mockResolvedValueOnce(null) // NEW-1
      .mockResolvedValueOnce(productRows[0]) // A1
      .mockResolvedValueOnce(productRows[1]); // B1

    (repo.create as jest.Mock).mockImplementation((x) => x);
    (repo.save as jest.Mock).mockImplementation((x) => Promise.resolve(x));

    const res = await service.processProducts(incoming as any);

    expect(res.total).toBe(3);
    expect(res.created).toBe(1);
    expect(res.updated).toBe(1);
    expect(res.notAffected).toBe(1);
    expect(res.skuAffected).toEqual(['B1']);
  });
});
