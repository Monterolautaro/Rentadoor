import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { ContractsRepository } from './contracts.repository';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { EmailModule } from 'src/email/email.module';
import { UserModule } from 'src/user/user.module';
import { ReservationsModule } from 'src/reservations/reservations.module';

@Module({
    imports: [SupabaseModule, ReservationsModule, EncryptionModule, EmailModule, UserModule],
    controllers: [ContractsController],
    providers: [ContractsService, ContractsRepository],
    exports: [ContractsService, ContractsRepository], 
})
export class ContractsModule { } 