// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication, ValidationPipe } from '@nestjs/common';
// import * as request from 'supertest';
// import { PropertiesModule } from '../properties.module';
// import { SupabaseModule } from '../../supabase/supabase.module';
// import { AuthModule } from '../../auth/auth.module';
// import { JwtModule } from '@nestjs/jwt';
// import { AuthGuard } from '../../auth/guards/auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { describe } from 'node:test';

// describe('PropertiesController (e2e)', () => {
//   let app: INestApplication;

//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [
//         PropertiesModule,
//         SupabaseModule,
//         AuthModule,
//         JwtModule.register({
//           secret: 'test-secret',
//           signOptions: { expiresIn: '1h' },
//         }),
//       ],
//     })
//     .overrideGuard(AuthGuard)
//     .useValue({ 
//       canActivate: (context) => {
//         const request = context.switchToHttp().getRequest();
//         request.user = {
//           id: '1',
//           email: 'test@example.com',
//           verified: true,
//           rol: 'propietario'
//         };
//         return true;
//       }
//     })
//     .overrideGuard(RolesGuard)
//     .useValue({ canActivate: () => true })
//     .compile();

//     app = moduleFixture.createNestApplication();
//     app.useGlobalPipes(new ValidationPipe());
//     await app.init();
//   });

//   const mockProperty = {
//     title: 'Test Property',
//     description: 'A test property for testing',
//     location: 'Test Location',
//     monthlyRent: 1000,
//     currency: 'USD',
//     expensePrice: 100,
//     environments: 2,
//     bathrooms: 1,
//     garages: 1,
//     approxM2: 85,
//     rentalPeriod: 12,
//     bedrooms: 2,
//     allImages: ['https://example.com/image1.jpg']
//   };

//   it('should create a property', async () => {
//     const response = await request(app.getHttpServer())
//       .post('/properties')
//       .send(mockProperty)
//       .expect(201);

//     expect(response.body).toBeDefined();
//     expect(response.body.title).toBe(mockProperty.title);
//   });

//   it('should get all properties', async () => {
//     const response = await request(app.getHttpServer())
//       .get('/properties')
//       .expect(200);

//     expect(response.body).toBeDefined();
//     expect(Array.isArray(response.body)).toBe(true);
//   });

//   it('should get available properties', async () => {
//     const response = await request(app.getHttpServer())
//       .get('/properties/available')
//       .expect(200);

//     expect(response.body).toBeDefined();
//     expect(Array.isArray(response.body)).toBe(true);
//   });

//   it('should validate property creation data', async () => {
//     const invalidProperty = {
//       title: '', // Invalid: empty title
//       monthlyRent: -100, // Invalid: negative price
//       currency: 'EUR', // Invalid: not in allowed values
//       environments: 0, // Invalid: less than minimum
//     };

//     const response = await request(app.getHttpServer())
//       .post('/properties')
//       .send(invalidProperty)
//       .expect(400);

//     expect(response.body).toBeDefined();
//     expect(response.body.message).toBeDefined();
//   });

//   it('should handle property not found', async () => {
//     const response = await request(app.getHttpServer())
//       .get('/properties/999999')
//       .expect(404);

//     expect(response.body.message).toContain('not found');
//   });

//   it('should get my properties', async () => {
//     const response = await request(app.getHttpServer())
//       .get('/properties/my-properties')
//       .expect(200);

//     expect(response.body).toBeDefined();
//     expect(Array.isArray(response.body)).toBe(true);
//   });

//   afterAll(async () => {
//     await app.close();
//   });
// }); 