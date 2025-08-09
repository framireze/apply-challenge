import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

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
  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
bootstrap();
