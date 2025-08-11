import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';

config();

const configService = new ConfigService();
const isTs = __filename.endsWith('.ts');
const root = isTs ? 'src' : 'dist';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),

  synchronize: false,
  logging: true,

  entities: [join(process.cwd(), root, '/**/*.entity.' + (isTs ? 'ts' : 'js'))],
  migrations: [
    join(process.cwd(), root, '/migrations/*.' + (isTs ? 'ts' : 'js')),
  ],

  migrationsTableName: 'migrations_history',
  migrationsRun: false,
});
