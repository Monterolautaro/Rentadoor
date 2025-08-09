import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import 'dotenv/config';
import * as bodyParser from 'body-parser';
import { json, urlencoded } from 'express';

const allowedOrigins = process.env.URL_FRONT?.split(',') || ['http://localhost:5173', 'http://localhost:3000', 'https://rentadoor.vercel.app/'];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  
  app.use(cookieParser());
  
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
  });

 
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

 
  app.use('/api/docusign/webhook', bodyParser.raw({ type: '*/*', limit: '10mb' }));


  app.use((req: any, res, next) => {
    if (req.originalUrl && req.originalUrl.includes('/api/docusign/webhook')) {
      req.rawBody = req.body; 
  
      try {
        req.body = JSON.parse(req.body.toString('utf8'));
      } catch (e) {
        throw new Error('Error parsing body');
      }
    }
    next();
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
