import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReservationsRepository } from '../reservations/reservations.repository';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    private readonly supabaseService: SupabaseService,
    private readonly emailService: EmailService,
  ) {}

  async getUserById(userId: number) {
    const { data: user, error } = await this.supabaseService.getClient().from('Users').select('*').eq('id', userId).single();
    if (error || !user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async reject(type: 'reservation' | 'verification', id: number, note: string) {
    if (type === 'reservation') {
      // Cambiar estado y guardar nota
      const updated = await this.reservationsRepository.update(id, {
        status: 'rechazada_admin',
        cancellation_reason: note,
      });
  
      const user = await this.getUserById(updated.user_id);
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e293b;">Reserva rechazada - Rentadoor</h2>
          <p>Hola <strong>${user.nombre || user.name}</strong>,</p>
          <p>Lamentamos informarte que tu reserva ha sido <span style="color: #dc2626; font-weight: bold;">rechazada</span> por administración.</p>
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 6px;">
            <b>Nota del administrador:</b><br />
            <span style="color: #dc2626;">${note}</span>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 14px; color: #64748b;">Si tienes dudas, puedes responder a este correo.<br>Equipo de Rentadoor</p>
        </div>
      `;
      await this.emailService.sendMail(
        user.email,
        'Reserva rechazada',
        `Tu reserva ha sido rechazada por administración. Nota del administrador: ${note}`,
        html
      );
      return { success: true };
    } else if (type === 'verification') {
     
      const { data: user, error } = await this.supabaseService.getClient().from('Users').update({ identityVerificationStatus: 'rejected' }).eq('id', id).select('*').single();
      if (error || !user) throw new NotFoundException('Usuario no encontrado');
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e293b;">Verificación rechazada - Rentadoor</h2>
          <p>Hola <strong>${user.nombre || user.name}</strong>,</p>
          <p>Lamentamos informarte que tu verificación de identidad ha sido <span style="color: #dc2626; font-weight: bold;">rechazada</span> por administración.</p>
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 6px;">
            <b>Nota del administrador:</b><br />
            <span style="color: #dc2626;">${note}</span>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 14px; color: #64748b;">Si tienes dudas, puedes responder a este correo.<br>Equipo de Rentadoor</p>
        </div>
      `;
      await this.emailService.sendMail(
        user.email,
        'Verificación rechazada',
        `Tu verificación de identidad ha sido rechazada por administración. Nota del administrador: ${note}`,
        html
      );
      return { success: true };
    } else {
      throw new BadRequestException('Tipo de rechazo inválido');
    }
  }
}