import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('products')
@Index(['category', 'brand']) // Para filtros comunes
@Index(['price']) // Para filtros por rango de precio
@Index(['stock']) // Para filtros por disponibilidad
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  brand: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  model?: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  // Campos de control interno
  @Column({ type: 'varchar', length: 100 })
  contentfulId: string; // sys.id de Contentful

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Para soft delete logic

  // Timestamps de Contentful (importante para sincronización)
  @Column({ type: 'timestamp' })
  contentfulCreatedAt: Date; // sys.createdAt

  @Column({ type: 'timestamp' })
  contentfulUpdatedAt: Date; // sys.updatedAt

  @Column({ type: 'int' })
  contentfulRevision: number; // sys.revision

  @Column({ type: 'varchar', length: 50 })
  contentType: string;

  // Timestamps internos
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date;

  @BeforeInsert()
  beforeInsert() {
    this.id = uuidv4();
    this.createdAt = new Date();
  }
}

