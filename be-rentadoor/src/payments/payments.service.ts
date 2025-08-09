import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';
import { EmailService } from '../email/email.service';
import { ReservationsRepository } from '../reservations/reservations.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly emailService: EmailService,
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async uploadPayment(file: any, reservationId: number, userId: number, type: string) {
    return this.paymentsRepository.savePaymentFile(reservationId, userId, type, file);
  }

  async getPaymentsByReservation(reservationId: number) {
    return this.paymentsRepository.getPaymentsByReservation(reservationId);
  }

  async approvePayment(reservationId: number) {
    const payments = await this.paymentsRepository.getPaymentsByReservation(reservationId);
    const tiposRequeridos = ['primer_mes', 'mes_deposito', 'deposito'];
    const tiposSubidos = payments.map((p: any) => p.type);
    const faltantes = tiposRequeridos.filter(tipo => !tiposSubidos.includes(tipo));
    if (faltantes.length > 0) {
      throw new BadRequestException('Faltan comprobantes para aprobar el pago: ' + faltantes.join(', '));
    }
    const result = await this.paymentsRepository.setPaymentStatus(reservationId, 'aprobado');

    // Obtener datos de la reserva y usuarios
    const reservation = await this.reservationsRepository.findById(reservationId);
    if (reservation && reservation.main_applicant_email) {
      // Notificar al inquilino (flujo actual)
      await this.emailService.sendMail(
        reservation.main_applicant_email,
        'Tus pagos fueron aprobados',
        'Tus pagos han sido aprobados. El contrato ya está disponible para firmar.',
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">¡Tus pagos fueron aprobados!</h2>
          <p>Hola,</p>
          <p>Nos complace informarte que tus pagos han sido <span style="color: #16a34a; font-weight: bold;">aprobados</span> y el contrato de alquiler ya está disponible para firmar.</p>
          <p>Puedes ingresar a tu panel de usuario para continuar con el proceso de firma.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 14px; color: #64748b;">Equipo de Rentadoor</p>
        </div>`
      );
    }
   
    if (reservation && reservation.owner_id) {
      
      const { data: owner, error } = await this.reservationsRepository['supabaseService'].getClient().from('Users').select('email, nombre, name').eq('id', reservation.owner_id).single();
      if (!error && owner && owner.email) {
        const contractUrl = `${process.env.FRONTEND_URL || 'https://rentadoor.com'}/contrato/${reservationId}`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Contrato listo para firmar</h2>
            <p>Hola <strong>${owner.nombre || owner.name || ''}</strong>,</p>
            <p>El contrato de alquiler ya está listo para ser firmado.</p>
            <p>
              <a href="${contractUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Haz click aquí y serás redireccionado a la página de Rentadoor en donde se encuentra tu contrato</a>
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 14px; color: #64748b;">Equipo de Rentadoor</p>
          </div>
        `;
        await this.emailService.sendMail(
          owner.email,
          'Contrato listo para firmar',
          `Hola ${owner.nombre || owner.name || ''}, el contrato ya está listo para firmar. Ingresa a Rentadoor para continuar el proceso.`,
          html
        );
      }
    }
    return result;
  }

  async rejectPayment(reservationId: number, motivo?: string) {
    // Actualizar estado en la base
    const result = await this.paymentsRepository.setPaymentStatus(reservationId, 'rechazado', motivo);
    // Obtener datos de la reserva y usuario
    const reservation = await this.reservationsRepository.findById(reservationId);
    // Enviar email al usuario
    if (reservation && reservation.main_applicant_email) {
      const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Tus pagos fueron rechazados - Rentadoor</h2>
      <p>Hola,</p>
      <p>Lamentamos informarte que los comprobantes de pago que subiste para tu reserva han sido <span style="color: #dc2626; font-weight: bold;">rechazados</span> por el administrador.</p>
      <p><b>Motivo de rechazo:</b></p>
      <p style="background: #fee2e2; color: #b91c1c; padding: 12px; border-radius: 6px;">${motivo || 'No especificado'}</p>
      <p>Por favor, vuelve a subir los comprobantes corregidos para continuar con el proceso de alquiler.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 14px; color: #64748b;">Si tienes dudas, puedes responder a este correo.<br>Equipo de Rentadoor</p>
    </div>
  `;
      await this.emailService.sendMail(
        reservation.main_applicant_email,
        'Tus pagos fueron rechazados',
        `Tus comprobantes de pago fueron rechazados. Motivo: ${motivo || 'No especificado'}\nPor favor, vuelve a subir los comprobantes corregidos para continuar con el proceso de alquiler.`,
        html
      );
    }
    return result;
  }

  async deletePayment(id: number) {
    return this.paymentsRepository.deletePayment(id);
  }
}
