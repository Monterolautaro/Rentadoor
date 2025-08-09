import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async savePaymentFile(reservationId: number, userId: number, type: string, file: any) {
    const supabase = this.supabaseService.getClient();

    const ext = file.originalname.split('.').pop();
    const filePath = `reservation_${reservationId}/${type}_${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('payments')
      .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: true });
    if (uploadError) throw new BadRequestException('Error subiendo archivo a storage: ' + uploadError.message);

    // Insertar un nuevo registro de pago para este comprobante
    const { data: created, error: createError } = await supabase
      .from('payments')
      .insert([{
        reservation_id: reservationId,
        user_id: userId,
        type,
        file_url: filePath,
        status: 'pendiente',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select('*')
      .single();
    if (createError) throw new BadRequestException('Error creando registro de pago: ' + createError.message);
    return created;
  }

  async getPaymentsByReservation(reservationId: number) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('reservation_id', reservationId);
    if (error) throw new BadRequestException('Error consultando pagos: ' + error.message);
    return data;
  }

  async setPaymentStatus(reservationId: number, status: string, motivo?: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('payments')
      .update({ status, motivo_rechazo: motivo || null, updated_at: new Date().toISOString() })
      .eq('reservation_id', reservationId)
      .select('*');
    if (error) throw new BadRequestException('Error actualizando estado de pago: ' + error.message);
    return data;
  }

  async deletePayment(id: number) {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    if (error) throw new BadRequestException('Error eliminando comprobante: ' + error.message);
    return { success: true };
  }
}
