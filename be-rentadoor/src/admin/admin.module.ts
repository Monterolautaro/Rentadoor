import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ReservationsRepository } from '../reservations/reservations.repository';
import { SupabaseModule } from '../supabase/supabase.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [SupabaseModule, EmailModule],
  controllers: [AdminController],
  providers: [AdminService, ReservationsRepository],
  exports: [AdminService],
})
export class AdminModule {}