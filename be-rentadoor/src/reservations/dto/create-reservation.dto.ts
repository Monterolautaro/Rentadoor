import { IsInt, IsDateString, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  property_id: number;

  @IsInt()
  user_id: number;

  @IsInt()
  owner_id: number;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsString()
  main_applicant_name?: string;

  @IsOptional()
  @IsString()
  main_applicant_email?: string;

  @IsOptional()
  @IsString()
  main_applicant_phone?: string;

  @IsOptional()
  @IsInt()
  adults_count?: number;

  @IsOptional()
  @IsInt()
  children_count?: number;

  @IsOptional()
  @IsString()
  cohabitants?: string;

  @IsOptional()
  @IsNumber()
  monthly_income?: number;

  @IsOptional()
  @IsNumber()
  total_household_income?: number;

  @IsOptional()
  @IsArray()
  income_documents?: string[];

  @IsOptional()
  @IsArray()
  additional_documents?: string[];

  @IsOptional()
  @IsString()
  owner_property_title?: string;

  @IsOptional()
  @IsString()
  income_source?: string;

  @IsOptional()
  @IsString()
  employer_name?: string;

  @IsOptional()
  @IsString()
  profession?: string;

  @IsOptional()
  @IsString()
  cuit_cuil?: string;
} 