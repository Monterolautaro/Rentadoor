import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PropertiesRepository } from './properties.repository';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [PropertiesController],
  providers: [PropertiesService, PropertiesRepository],
  exports: [PropertiesService]
})
export class PropertiesModule {} 