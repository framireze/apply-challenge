import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ContentfulProductItem } from 'src/contentful/interfaces/contentful-response.interface';
import _ from 'lodash';
import { GetProductsQueryDto } from './dto/get-products-query.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getProducts(filters: GetProductsQueryDto): Promise<{ success: boolean, message: string, data: Product[], total: number, page: number, limit: number }> {
    try{
      let products = await this.productRepository.find({ where: { isActive: true } });
      if (filters.name) products = products.filter(product => product.name.toLowerCase().includes(filters.name.toLowerCase()));
      if (filters.category) products = products.filter(product => product.category.toLowerCase().trim().includes(filters.category.toLowerCase().trim()));
      if (filters.minPrice) products = products.filter(product => Number(product.price) >= filters.minPrice);
      if (filters.maxPrice) products = products.filter(product => Number(product.price) <= filters.maxPrice);
      if (filters.brand) products = products.filter(product => product.brand.toLowerCase().includes(filters.brand.toLowerCase()));
      if (filters.model) products = products.filter(product => product.model?.toLowerCase().includes(filters.model.toLowerCase()));

      // Pagination
      products = products.sort((a, b) => a.name.localeCompare(b.name, "en", { ignorePunctuation: true }));
      const total = products.length;
      const startIndex = (filters.page - 1) * filters.limit;
      const endIndex = startIndex + filters.limit;
      const paginatedProducts = products.slice(startIndex, endIndex);

      return { success: true, message: 'Products fetched successfully', total, page: filters.page, limit: filters.limit, data: paginatedProducts };
    } catch (error) {
      this.handleException(error);
    }
  }

  async getAllProducts(isActive?: boolean): Promise<Product[]> {
    let products= await this.productRepository.find({ select: { id: true, sku: true, name: true, brand: true, model: true, category: true, color: true, price: true, currency: true, stock: true, isActive: true, deletedAt: true } });
    if (isActive !== undefined) products = products.filter(product => product.isActive === isActive);
    return products;
  }

  async create(createProductDto: CreateProductDto) {
    try{      
      const product = this.productRepository.create(createProductDto);
      const saved = await this.productRepository.save(product);
      return saved;
    } catch (error) {
      this.handleException(error);
    }
  }

  async updateProduct(sku: string, updateProductDto: UpdateProductDto) {
    try{
      const product = await this.productRepository.findOne({ where: { sku } });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      return await this.productRepository.save({ ...product, ...updateProductDto });
    } catch (error) {
      this.handleException(error);
    }
  }

  async deleteProduct(sku: string) {
    try{
      const product = await this.productRepository.findOne({ where: { sku } });
      if (!product) throw new NotFoundException('Product not found');
      product.isActive = false;
      product.deletedAt = new Date();
      await this.productRepository.save(product);
      return { success: true, message: 'Product deleted successfully' };
    } catch (error) {
      this.handleException(error);
    }
  }

  async processProducts(products: ContentfulProductItem[]): Promise<{ total: number, created: number, updated: number, notAffected: number, skuAffected: string[] }> {
    const results = {
      total: products.length,
      created: 0,
      updated: 0,
      notAffected: 0,
      skuAffected: [] as string[],
    }
    try{
      for (const product of products) {
        const productDB = await this.productRepository.findOne({ where: { sku: product.fields.sku } });
        if (!productDB) {
          const newProduct = this.productRepository.create({
            sku: product.fields.sku,
            name: product.fields.name,
            brand: product.fields.brand,
            model: product.fields.model,
            category: product.fields.category,
            color: product.fields.color,
            price: product.fields.price,
            currency: product.fields.currency,
            stock: product.fields.stock,
            isActive: true,
            contentfulId: product.sys.id,
            contentfulCreatedAt: new Date(product.sys.createdAt),
            contentfulUpdatedAt: new Date(product.sys.updatedAt),
            contentfulRevision: product.sys.revision,
            contentType: product.sys.contentType.sys.id,
          });
          await this.productRepository.save(newProduct);
          results.created++;
        } else {
          const {item, isEqual} = this.hasProductChanged(product, productDB);
          if (!isEqual) {
            await this.productRepository.save({ ...productDB, ...item });
            results.updated++;
            results.skuAffected.push(productDB.sku);
          } else {
            results.notAffected++;
          }
        }
      }

      return results;
    } catch (error) {
      this.handleException(error);
    }
  }

  private hasProductChanged(item: ContentfulProductItem, existing: Product): {item: UpdateProductDto, isEqual: boolean} {
    const contentfulData = {
      name: item.fields.name,
      brand: item.fields.brand,
      model: item.fields.model,
      category: item.fields.category,
      color: item.fields.color,
      price: Number(item.fields.price),
      currency: item.fields.currency,
      stock: Number(item.fields.stock),
      contentType: item.sys.contentType.sys.id,
    };
    const existingData = _.pick(existing, ['name', 'brand', 'model', 'category', 'color', 'price', 'stock', 'currency', 'contentType']);
    existingData.price = Number(existingData.price);
    existingData.stock = Number(existingData.stock);
    return {item: contentfulData, isEqual: _.isEqual(contentfulData, existingData)};
  }

  private handleException(error: Error): never {
    this.logger.error(error.message, error.stack);
    if (error instanceof NotFoundException) {
      throw new NotFoundException({ success: false, message: error.message });
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
