import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { IReservation } from './interfaces/reservation.interface';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createDto: CreateReservationDto): Promise<IReservation> {
    // Validar conflictos de fechas antes de crear
    const conflict = await this.findConflict(
      createDto.property_id,
      createDto.start_date,
      createDto.end_date
    );
    if (conflict) {
      throw new BadRequestException('La propiedad no está disponible en las fechas seleccionadas.');
    }
  
    const { id, ...insertData } = createDto as any;
    insertData.start_date = insertData.start_date.split('T')[0];
    insertData.end_date = insertData.end_date.split('T')[0];
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('reservations')
      .insert({ ...insertData, status: 'pendiente' })
      .select('*')
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async findById(id: number): Promise<IReservation> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) throw new NotFoundException('Reserva no encontrada');
    return data;
  }

  async findByUser(userId: number): Promise<IReservation[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data || [];
  }

  async findByProperty(propertyId: number): Promise<IReservation[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data || [];
  }

  async findAll(): Promise<IReservation[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data || [];
  }

  async findConflict(propertyId: number, start: string, end: string): Promise<IReservation | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('property_id', propertyId)
      .in('status', ['pendiente', 'preaprobada', 'aprobada'])
      .or(`start_date.lte.${end},end_date.gte.${start}`)
      .limit(1);
    if (error) throw new BadRequestException(error.message);
    return data && data.length > 0 ? data[0] : null;
  }

  async update(id: number, updateDto: UpdateReservationDto): Promise<IReservation> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('reservations')
      .update({ ...updateDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) throw new BadRequestException(error?.message || 'No se pudo actualizar la reserva');
    return data;
  }

  async remove(id: number): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);
    if (error) throw new BadRequestException(error.message);
  }

  async findByOwner(ownerId: number): Promise<IReservation[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data || [];
  }

  async addCoEarner(coEarner: {
    reservation_id: number;
    full_name: string;
    dni?: string;
    cuit_cuil?: string;
    income_source?: string;
    employer_name?: string;
    income_amount?: number;
  }) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('co_earners')
      .insert(coEarner)
      .select('*')
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getCoEarnersByReservation(reservation_id: number) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('co_earners')
      .select('*')
      .eq('reservation_id', reservation_id);
    if (error) throw new BadRequestException(error.message);
    return data || [];
  }
} 