import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PropertiesRepository } from './properties.repository';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { IProperty } from './interfaces/property.interface';

@Injectable()
export class PropertiesService {
  constructor(private readonly propertiesRepository: PropertiesRepository) {}

  async create(createPropertyDto: CreatePropertyDto, ownerId: number): Promise<IProperty> {
    return this.propertiesRepository.create(createPropertyDto, ownerId);
  }

  async findAll(): Promise<IProperty[]> {
    return this.propertiesRepository.findAll();
  }

  async findByOwner(ownerId: number): Promise<IProperty[]> {
    return this.propertiesRepository.findByOwner(ownerId);
  }

  async findOne(id: number): Promise<IProperty> {
    return this.propertiesRepository.findOne(id);
  }

  async update(id: number, updatePropertyDto: UpdatePropertyDto, userId: number): Promise<IProperty> {
    return this.propertiesRepository.update(id, updatePropertyDto, userId);
  }

  async remove(id: number, userId: number): Promise<void> {
    return this.propertiesRepository.remove(id, userId);
  }

  async searchProperties(filters: any): Promise<IProperty[]> {
    return this.propertiesRepository.searchProperties(filters);
  }

  async getPropertiesByStatus(status: string): Promise<IProperty[]> {
    return this.propertiesRepository.searchProperties({ status });
  }

  async getAvailableProperties(): Promise<IProperty[]> {
    return this.propertiesRepository.searchProperties({ status: 'Disponible' });
  }
} 