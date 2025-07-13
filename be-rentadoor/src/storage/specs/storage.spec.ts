import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { StorageModule } from '../storage.module';
import { SupabaseModule } from '../../supabase/supabase.module';
import { EncryptionModule } from '../../encryption/encryption.module';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from '../../email/email.module';
import { AuthModule } from '../../auth/auth.module';
import * as fs from 'fs';
import * as path from 'path';

describe('StorageController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                StorageModule, 
                SupabaseModule, 
                EncryptionModule,
                EmailModule,
                AuthModule,
                JwtModule.register({
                    secret: 'test-secret',
                    signOptions: { expiresIn: '1h' },
                }),
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    it('should upload two encrypted files', async () => {
        const file1Path = path.join(__dirname, 'test_files', 'test_selfie.png');
        const file2Path = path.join(__dirname, 'test_files', 'test_dni.png');

        const userId = 9;

        const response = await request(app.getHttpServer())
            .post('/storage/upload')
            .field('userId', userId)
            .attach('files', file1Path)
            .attach('files', file2Path);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('selfie');
        expect(response.body).toHaveProperty('dni');
    });

    it('should fetch all encrypted files', async () => {
        const response = await request(app.getHttpServer())
            .get('/storage')
            .expect(200);

        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should upload files successfully', async () => {
        const mockFiles = [
            {
                fieldname: 'files',
                originalname: 'test1.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                buffer: Buffer.from('test image 1'),
                size: 1024
            },
            {
                fieldname: 'files',
                originalname: 'test2.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                buffer: Buffer.from('test image 2'),
                size: 1024
            }
        ];

        const res = await request(app.getHttpServer())
            .post('/storage/upload')
            .attach('files', Buffer.from('test image 1'), 'test1.jpg')
            .attach('files', Buffer.from('test image 2'), 'test2.jpg')
            .expect(201);

        expect(res.body).toBeDefined();
        expect(res.body.selfie).toBeDefined();
        expect(res.body.dni).toBeDefined();

        const response = await request(app.getHttpServer())
            .get('/storage')
            .expect(200);

        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body)).toBe(true);
    });

    afterAll(async () => {
        await app.close();
    });
});
