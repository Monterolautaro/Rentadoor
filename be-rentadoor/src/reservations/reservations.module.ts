import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { StorageModule } from '../storage/storage.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationsRepository } from './reservations.repository';
import { EmailModule } from 'src/email/email.module';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [SupabaseModule, StorageModule, EmailModule, PropertiesModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsRepository],
  exports: [ReservationsService, ReservationsRepository]
})
export class ReservationsModule {} 