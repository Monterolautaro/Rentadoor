import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { IProperty } from './interfaces/property.interface';


@Injectable()
export class PropertiesRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createPropertyDto: CreatePropertyDto, ownerId: number): Promise<IProperty> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('properties')
      .insert({
        owner_id: ownerId,
        title: createPropertyDto.title,
        description: createPropertyDto.description,
        location: createPropertyDto.location,
        monthly_rent: createPropertyDto.monthlyRent,
        currency: createPropertyDto.currency,
        expense_price: createPropertyDto.expensePrice || 0,
        environments: createPropertyDto.environments,
        bathrooms: createPropertyDto.bathrooms,
        garages: createPropertyDto.garages,
        guests: createPropertyDto.guests,
        bedrooms: createPropertyDto.bedrooms,
        rating: 0,
        image: createPropertyDto.allImages?.[0] || null,
        all_images: createPropertyDto.allImages || [],
        status: 'Disponible'
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create property: ${error.message}`);
    }

    return data;
  }

  async findAll(): Promise<IProperty[]> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }

    return data || [];
  }

  async findByOwner(ownerId: number): Promise<IProperty[]> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }

    return data || [];
  }

  async findOne(id: number): Promise<IProperty> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return data;
  }

  async update(id: number, updatePropertyDto: UpdatePropertyDto, userId: number): Promise<IProperty> {
    // Verificar que la propiedad pertenece al usuario
    const property = await this.findOne(id);
    if (property.owner_id !== userId) {
      throw new ForbiddenException('You can only update your own properties');
    }

    const supabase = this.supabaseService.getClient();
    
    const updateData: any = {};
    if (updatePropertyDto.title) updateData.title = updatePropertyDto.title;
    if (updatePropertyDto.description !== undefined) updateData.description = updatePropertyDto.description;
    if (updatePropertyDto.location) updateData.location = updatePropertyDto.location;
    if (updatePropertyDto.monthlyRent) updateData.monthly_rent = updatePropertyDto.monthlyRent;
    if (updatePropertyDto.currency) updateData.currency = updatePropertyDto.currency;
    if (updatePropertyDto.expensePrice !== undefined) updateData.expense_price = updatePropertyDto.expensePrice;
    if (updatePropertyDto.environments) updateData.environments = updatePropertyDto.environments;
    if (updatePropertyDto.bathrooms !== undefined) updateData.bathrooms = updatePropertyDto.bathrooms;
    if (updatePropertyDto.garages !== undefined) updateData.garages = updatePropertyDto.garages;
    if (updatePropertyDto.guests) updateData.guests = updatePropertyDto.guests;
    if (updatePropertyDto.bedrooms) updateData.bedrooms = updatePropertyDto.bedrooms;
    if (updatePropertyDto.allImages) {
      updateData.image = updatePropertyDto.allImages[0] || null;
      updateData.all_images = updatePropertyDto.allImages;
    }

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update property: ${error.message}`);
    }

    return data;
  }

  async remove(id: number, userId: number): Promise<void> {
    // Verificar que la propiedad pertenece al usuario
    const property = await this.findOne(id);
    if (property.owner_id !== userId) {
      throw new ForbiddenException('You can only delete your own properties');
    }

    const supabase = this.supabaseService.getClient();
    
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }

  async searchProperties(filters: any): Promise<IProperty[]> {
    const supabase = this.supabaseService.getClient();
    let query = supabase.from('properties').select('*');

    if (filters.searchTerm) {
      query = query.or(`title.ilike.%${filters.searchTerm}%,location.ilike.%${filters.searchTerm}%`);
    }

    if (filters.propertyType) {
      // Aquí podrías agregar un campo type a la tabla si es necesario
    }

    if (filters.minPrice) {
      query = query.gte('monthly_rent', filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte('monthly_rent', filters.maxPrice);
    }

    if (filters.currency) {
      query = query.eq('currency', filters.currency);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search properties: ${error.message}`);
    }

    return data || [];
  }
} 