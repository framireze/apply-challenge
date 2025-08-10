import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnvironment } from './config/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import { ContentfulModule } from './contentful/contentful.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
      envFilePath: [
        '.env'
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        ssl: configService.get<boolean>('DB_SSL') ? { rejectUnauthorized: false } : false,
        extra: {
          max: configService.get<number>('DB_POOL_SIZE'),
        },
        autoLoadEntities: true,        
        synchronize: false,        
        //logging: configService.get<string>('NODE_ENV') === 'development', 
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        //For migrations
        migrations: [__dirname + '/migrations/*.ts'],
        migrationsRun: false,
        migrationsTableName: 'migrations_history',
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    AuthModule,
    ReportsModule,
    ContentfulModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
