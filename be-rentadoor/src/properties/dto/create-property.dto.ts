import { IsString, IsNumber, IsOptional, IsArray, IsIn, Min, Max } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  location: string;

  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @IsString()
  @IsIn(['ARS', 'USD'])
  currency: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  expensePrice?: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  environments: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  bathrooms: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  garages: number;

  @IsNumber()
  @Min(1)
  @Max(20)
  guests: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  bedrooms: number;

  @IsArray()
  @IsOptional()
  allImages?: string[];
} 