import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  
  synchronize: false,
  logging: true,

  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  
  migrationsTableName: 'migrations_history',
  migrationsRun: false,
});