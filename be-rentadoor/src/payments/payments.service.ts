import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

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
    return this.paymentsRepository.setPaymentStatus(reservationId, 'aprobado');
  }

  async rejectPayment(reservationId: number, motivo?: string) {
    return this.paymentsRepository.setPaymentStatus(reservationId, 'rechazado', motivo);
  }
}
