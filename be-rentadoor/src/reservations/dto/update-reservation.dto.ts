import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './create-reservation.dto';
import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  admin_preapproved?: boolean;

  @IsOptional()
  @IsString()
  admin_preapproved_at?: string;

  @IsOptional()
  @IsBoolean()
  owner_approved?: boolean;

  @IsOptional()
  @IsString()
  owner_approved_at?: string;

  @IsOptional()
  @IsString()
  cancellation_reason?: string;

  @IsOptional()
  @IsString()
  contract_status?: string;

  @IsOptional()
  @IsString()
  contract_url?: string;
} 