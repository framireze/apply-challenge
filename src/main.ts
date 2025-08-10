import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  });

  app.setGlobalPrefix(process.env.ENDPOINT_BASE || '');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      //exceptionFactory: (errors) => new BadRequestException(errors),
    })
  )

  // 🎯 CONFIGURACIÓN DE SWAGGER
  const config = new DocumentBuilder()
    .setTitle('APPLY Challenge API')
    .setDescription(`
      API that synchronizes product data from Contentful every hour and provides 
      public endpoints with pagination/filtering and private administrative reports.
      
      ## Features
      - 🔄 Automatic hourly sync with Contentful API
      - 📋 Public product endpoints with pagination (max 5 items)
      - 🔍 Advanced filtering by name, category, brand, price range
      - ❌ Soft delete functionality
      - 📊 Private reports protected by JWT
      
      ## Authentication
      Private endpoints require JWT token in Authorization header:
      \`Authorization: Bearer <your-jwt-token>\`
      
      Get token from: **POST /auth/jwt**
    `)
    .setVersion('1.0')
    
    // 🔐 Configuración JWT para endpoints privados
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // Nombre de referencia
    )
    
    // 📊 Tags para agrupar endpoints
    .addTag('Products', 'Public product operations')
    .addTag('Reports', 'Private administrative reports')
    
    // 🌐 Servers
    .addServer('http://localhost:3000', 'Development server')
    
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    // Configuraciones adicionales
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  // 📚 Montar Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'APPLY Challenge API Documentation',
    customfavIcon: 'https://media.licdn.com/dms/image/v2/C560BAQEGUtAomDxHHg/company-logo_200_200/company-logo_200_200/0/1630667871734/applydigital_logo?e=2147483647&v=beta&t=WA1J1Aa4lUf9XOS0P3RrAnBvXMwB9Ee_IwvPSpigk30',
    customCssUrl: '/swagger-custom.css', // CSS personalizado opcional
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
  });
}
bootstrap();
