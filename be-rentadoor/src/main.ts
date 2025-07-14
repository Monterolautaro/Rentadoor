import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import 'dotenv/config';

const allowedOrigins = process.env.URL_FRONT?.split(',') || ['http://localhost:5173', 'http://localhost:3000', 'https://rentadoor.vercel.app/'];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar cookie-parser
  app.use(cookieParser());
  
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    exceptionFactory: (errors) => {
      const cleanErrors = errors.map(error => {
        return {
          property: error.property,
          constraints: error.constraints
        }
      })
      return new BadRequestException({
        alert: "se han detectado los siguientes errores:",
        errors: cleanErrors
      });}}))

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
