// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { EncryptionModule } from './encryption/encryption.module';
import { StorageModule } from './storage/storage.module';
import { PropertiesModule } from './properties/properties.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    UserModule,
    AuthModule,
    EmailModule,
    EncryptionModule,
    StorageModule,
    PropertiesModule,
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '35m' },
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
