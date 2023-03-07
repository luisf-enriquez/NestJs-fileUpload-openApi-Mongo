import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error'] });
  app.enableCors();
  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    // forbidNonWhitelisted: true 
  }));

  const config = app.get(ConfigService);
  const port = config.get<number>('port');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Poke Trainer API')
    .setDescription('Some CRUD operations with nest and mongo')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  logger.log(`Pokedex mongo DB is running on port: ${await app.getUrl()}`);
}
bootstrap();
