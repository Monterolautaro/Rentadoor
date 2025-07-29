import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { ContractsRepository } from './contracts.repository';
import { SupabaseService } from '../supabase/supabase.service';
import { EncryptionService } from '../encryption/encryption.service';
import { EmailService } from '../email/email.service';

@Module({
    imports: [],
    controllers: [ContractsController],
    providers: [ContractsService, ContractsRepository, SupabaseService, EncryptionService, EmailService],
    exports: [ContractsService],
})
export class ContractsModule { } 