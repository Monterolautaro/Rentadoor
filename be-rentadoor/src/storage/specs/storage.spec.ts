import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { StorageModule } from '../storage.module';
import { SupabaseModule } from '../../supabase/supabase.module';
import { EncryptionModule } from '../../encryption/encryption.module';
import * as fs from 'fs';
import * as path from 'path';

describe('StorageController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [StorageModule, SupabaseModule, EncryptionModule],
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

        console.log('Response status:', response.status);
        console.log('Response body:', response.body);

        if (response.status !== 201) {
            console.error('Error response:', response.body);
        }

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('selfie');
        expect(response.body).toHaveProperty('dni');
    });

    it('should fetch all encrypted files', async () => {
        const response = await request(app.getHttpServer())
            .get('/storage')
            .expect(res => {
                console.log('Upload response:', res.body);
                if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
            });

        console.log('All files:', response.body);
        expect(Array.isArray(response.body)).toBe(true);
    });

    afterAll(async () => {
        await app.close();
    });
});
