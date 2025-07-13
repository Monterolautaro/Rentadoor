import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { StorageModule } from '../storage.module';
import { SupabaseModule } from '../../supabase/supabase.module';
import { EncryptionModule } from '../../encryption/encryption.module';
import { AuthModule } from '../../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

describe('Property Images Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        StorageModule,
        SupabaseModule,
        EncryptionModule,
        AuthModule,
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ 
      canActivate: (context) => {
        const request = context.switchToHttp().getRequest();
        request.user = {
          id: '1',
          email: 'test@example.com',
          verified: true,
          rol: 'propietario'
        };
        return true;
      }
    })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('should upload property images', async () => {
    const response = await request(app.getHttpServer())
      .post('/storage/upload-property-images')
      .attach('images', Buffer.from('test image data'), 'test1.jpg')
      .attach('images', Buffer.from('test image data 2'), 'test2.jpg')
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.images).toBeDefined();
    expect(Array.isArray(response.body.images)).toBe(true);
  });

  it('should reject upload without images', async () => {
    const response = await request(app.getHttpServer())
      .post('/storage/upload-property-images')
      .expect(400);

    expect(response.status).toBe(400);
  });

  it('should reject too many images', async () => {
    const response = await request(app.getHttpServer())
      .post('/storage/upload-property-images')
      .attach('images', Buffer.from('test image data'), 'test1.jpg')
      .attach('images', Buffer.from('test image data'), 'test2.jpg')
      .attach('images', Buffer.from('test image data'), 'test3.jpg')
      .attach('images', Buffer.from('test image data'), 'test4.jpg')
      .attach('images', Buffer.from('test image data'), 'test5.jpg')
      .attach('images', Buffer.from('test image data'), 'test6.jpg')
      .attach('images', Buffer.from('test image data'), 'test7.jpg')
      .attach('images', Buffer.from('test image data'), 'test8.jpg')
      .attach('images', Buffer.from('test image data'), 'test9.jpg')
      .attach('images', Buffer.from('test image data'), 'test10.jpg')
      .attach('images', Buffer.from('test image data'), 'test11.jpg')
      .expect(400);

    expect(response.status).toBe(400);
  });

  it('should get property image URL', async () => {
    const response = await request(app.getHttpServer())
      .get('/storage/property-image/test-image.jpg')
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.url).toBeDefined();
  });

  it('should delete property image', async () => {
    const response = await request(app.getHttpServer())
      .delete('/storage/property-image/test-image.jpg')
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.message).toBe('Imagen eliminada correctamente');
  });

  afterAll(async () => {
    await app.close();
  });
}); 