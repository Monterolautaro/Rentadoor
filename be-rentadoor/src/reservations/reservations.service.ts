import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReservationsRepository } from './reservations.repository';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { IReservation } from './interfaces/reservation.interface';
import { StorageService } from '../storage/storage.service';
import { Multer } from 'multer';
import { EmailService } from '../email/email.service';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    private readonly storageService: StorageService,
    private readonly emailService: EmailService,
  ) {}

  async create(createDto: CreateReservationDto, userId: number): Promise<IReservation> {
    if (createDto.user_id !== userId) {
      throw new ForbiddenException('No puedes crear reservas para otro usuario');
    }
    return this.reservationsRepository.create(createDto);
  }

  async findById(id: number, userId: number, role: string): Promise<IReservation> {
    const reservation = await this.reservationsRepository.findById(id);
    if (role !== 'admin' && reservation.user_id !== userId && reservation.owner_id !== userId) {
      throw new ForbiddenException('No tienes acceso a esta reserva');
    }
    return reservation;
  }

  async findByUser(userId: number): Promise<IReservation[]> {
    return this.reservationsRepository.findByUser(userId);
  }

  async findByProperty(propertyId: number): Promise<IReservation[]> {
    return this.reservationsRepository.findByProperty(propertyId);
  }

  async findAll(): Promise<IReservation[]> {
    return this.reservationsRepository.findAll();
  }

  async findByOwner(ownerId: number): Promise<IReservation[]> {
    return this.reservationsRepository.findByOwner(ownerId);
  }

  async update(id: number, updateDto: UpdateReservationDto, userId: number, role: string): Promise<IReservation> {
    const reservation = await this.reservationsRepository.findById(id);
    if (role !== 'admin' && reservation.user_id !== userId && reservation.owner_id !== userId) {
      throw new ForbiddenException('No tienes permisos para actualizar esta reserva');
    }
    return this.reservationsRepository.update(id, updateDto);
  }

  async remove(id: number, userId: number, role: string): Promise<void> {
    const reservation = await this.reservationsRepository.findById(id);
    if (role !== 'admin' && reservation.user_id !== userId && reservation.owner_id !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar esta reserva');
    }
    return this.reservationsRepository.remove(id);
  }

  async adminApprove(id: number, userId: number, role: string): Promise<IReservation> {
    if (role !== 'admin') throw new ForbiddenException('Solo admin puede aprobar');
    const reservation = await this.reservationsRepository.findById(id);
    if (reservation.status !== 'pendiente') {
      throw new BadRequestException('Solo se pueden aprobar reservas pendientes');
    }
    const updated = await this.reservationsRepository.update(id, {
      status: 'preaprobada_admin',
      admin_preapproved: true,
      admin_preapproved_at: new Date().toISOString(),
    });

    const userEmail = await this.getUserEmailById(updated.user_id);
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">¡Tu reserva ha sido pre-aprobada! - Rentadoor</h2>
        <p>Hola,</p>
        <p>Nos complace informarte que tu solicitud de reserva ha sido <span style="color: #059669; font-weight: bold;">pre-aprobada por el equipo de administración</span>.</p>
        <p><b>Siguiente paso:</b> La reserva será revisada por el propietario de la propiedad. Te notificaremos cuando el propietario tome una decisión.</p>
        <p>Gracias por confiar en Rentadoor.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 14px; color: #64748b;">Si tienes dudas, puedes responder a este correo.<br>Equipo de Rentadoor</p>
      </div>
    `;
    await this.emailService.sendMail(
      userEmail,
      'Reserva pre-aprobada por administración',
      'Tu reserva ha sido pre-aprobada por administración. Siguiente paso: revisión por parte del propietario.',
      html
    );

    return updated;
  }

  async ownerApprove(id: number, userId: number, role: string): Promise<IReservation> {
    if (role !== 'user') throw new ForbiddenException('Solo el propietario puede aprobar');
    const reservation = await this.reservationsRepository.findById(id);
    if (reservation.status !== 'preaprobada_admin') {
      throw new BadRequestException('Solo se pueden aprobar reservas preaprobadas por admin');
    }
    if (reservation.owner_id !== userId) {
      throw new ForbiddenException('Solo el propietario de la propiedad puede aprobar esta reserva');
    }
    const updated = await this.reservationsRepository.update(id, {
      status: 'aprobada',
      owner_approved: true,
      owner_approved_at: new Date().toISOString(),
    });

    const userEmail = await this.getUserEmailById(updated.user_id);
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">¡Felicidades! Tu reserva ha sido aprobada por el propietario - Rentadoor</h2>
        <p>Hola,</p>
        <p>El propietario ha <span style="color: #059669; font-weight: bold;">aprobado</span> tu solicitud de reserva.</p>
        <p>En breves, estará llegando un contrato auto-generado que tendrán que firmar ambas partes para finalizar el proceso.</p>
        <p>¡Gracias por confiar en Rentadoor!</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 14px; color: #64748b;">Si tienes dudas, puedes responder a este correo.<br>Equipo de Rentadoor</p>
      </div>
    `;
    await this.emailService.sendMail(
      userEmail,
      '¡Felicidades! El propietario aprobó tu reserva',
      'El propietario ha aprobado tu reserva. Pronto recibirás el contrato para firmar.',
      html
    );

    return updated;
  }

  async ownerReject(id: number, userId: number, role: string): Promise<IReservation> {
    if (role !== 'user') throw new ForbiddenException('Solo el propietario puede rechazar');
    const reservation = await this.reservationsRepository.findById(id);
    if (reservation.status !== 'preaprobada_admin') {
      throw new BadRequestException('Solo se pueden rechazar reservas preaprobadas por admin');
    }
    if (reservation.owner_id !== userId) {
      throw new ForbiddenException('Solo el propietario de la propiedad puede rechazar esta reserva');
    }
    const updated = await this.reservationsRepository.update(id, {
      status: 'rechazada_owner',
      owner_approved: false,
      owner_approved_at: new Date().toISOString(),
    });
    
    const userEmail = await this.getUserEmailById(updated.user_id);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Reserva rechazada por el propietario - Rentadoor</h2>
        <p>Hola,</p>
        <p>Lamentamos informarte que el propietario ha decidido <span style="color: #dc2626; font-weight: bold;">rechazar</span> tu solicitud de reserva.</p>
        <p>Puedes contactar con el propietario o buscar otras propiedades disponibles en nuestra plataforma.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 14px; color: #64748b;">Si tienes dudas, puedes responder a este correo.<br>Equipo de Rentadoor</p>
      </div>
    `;

    await this.emailService.sendMail(
      userEmail,
      'Reserva rechazada por el propietario',
      'El propietario ha decidido rechazar tu solicitud de reserva.',
      html
    );

    return updated;
  }

  async uploadDocument(file: Multer.File, userId: number): Promise<string> {
 
    return this.storageService.uploadEncryptedFile(
      file.buffer,
      userId,
      file.originalname,
      'reservations-docs', 
      'encrypted_files' 
    );
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
    return this.reservationsRepository.addCoEarner(coEarner);
  }

  async getCoEarnersByReservation(reservation_id: number) {
    return this.reservationsRepository.getCoEarnersByReservation(reservation_id);
  }

  private async getUserEmailById(userId: number): Promise<string> {
    const { data: user, error } = await this.reservationsRepository['supabaseService'].getClient().from('Users').select('email').eq('id', userId).single();
    if (error || !user) throw new NotFoundException('Usuario no encontrado');
    return user.email;
  }
} 