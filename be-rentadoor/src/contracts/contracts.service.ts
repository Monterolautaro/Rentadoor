import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ContractsRepository } from './contracts.repository';
import { SupabaseService } from '../supabase/supabase.service';
import { EncryptionService } from '../encryption/encryption.service';
import { ReservationsRepository } from '../reservations/reservations.repository';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ContractsService {
  constructor(
    private readonly contractsRepository: ContractsRepository,
    private readonly supabaseService: SupabaseService,
    private readonly encryptionService: EncryptionService,
    private readonly reservationsRepository: ReservationsRepository,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  async uploadContract(file: any, reservationId: number) {

    const contract = await this.contractsRepository.saveContractFile(reservationId, file);

    if(!contract) throw new BadRequestException('Error al guardar el contrato');

    await this.reservationsRepository.update(reservationId, {
      contract_status: 'enviado',
      contract_url: contract.file_url,
    });
    
    const reservation = await this.reservationsRepository.findById(reservationId);
    const tenant = await this.userService.getUserById(reservation.user_id);
    const owner = await this.userService.getUserById(reservation.owner_id);
   
    const contractLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/contrato/${reservationId}`;
    const subject = 'Nuevo contrato disponible para firmar - Rentadoor';

    const htmlOwner = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e293b;">Tienes un nuevo contrato para firmar</h2>
      <p>Hola ${owner.nombre}!</p>
      <p>Ya está disponible el contrato de alquiler para tu reserva. Puedes verlo y firmarlo ingresando al siguiente enlace:</p>
      <p><a href="${contractLink}" style="color: #2563eb; font-weight: bold;">Ver contrato</a></p>
      <p>La firma estará habilitada una vez que el inquilino realice el pago de la reserva.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 14px; color: #64748b;">Si tienes dudas, puedes responder a este correo.<br>Equipo de Rentadoor</p>
    </div>`;

    const htmlTenant = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e293b;">Tienes un nuevo contrato para firmar</h2>
      <p>Hola ${tenant.nombre}!</p>
      <p>Ya está disponible el contrato de alquiler para tu reserva. Puedes verlo y firmarlo ingresando al siguiente enlace:</p>
      <p><a href="${contractLink}" style="color: #2563eb; font-weight: bold;">Ver contrato</a></p>
      <p>Recuerda que la firma estará habilitada una vez que los pagos estén aprobados.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 14px; color: #64748b;">Si tienes dudas, puedes responder a este correo.<br>Equipo de Rentadoor</p>
    </div>`;

    await this.emailService.sendMail(tenant.email, subject, 'Tienes un nuevo contrato para firmar.', htmlTenant);
    await this.emailService.sendMail(owner.email, subject, 'Tienes un nuevo contrato para firmar.', htmlOwner);
    return contract;
  }

  async getContractByReservation(reservationId: number) {
    return this.contractsRepository.getContractByReservation(reservationId);
  }

  async downloadAndDecryptContract(contractId: number) {
    // Buscar metadata del contrato
    const supabase = this.supabaseService.getClient();
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();
    if (error || !contract) throw new NotFoundException('Contrato no encontrado');
    // Descargar archivo encriptado
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('contracts')
      .download(contract.file_url);
    if (downloadError) throw new BadRequestException('Error descargando archivo: ' + downloadError.message);
    const encryptedBuffer = Buffer.from(await fileData.arrayBuffer());
    // Desencriptar
    const iv = Buffer.from(contract.iv, 'base64');
    const authTag = Buffer.from(contract.auth_tag, 'base64');
    const decryptedBuffer = this.encryptionService.decryptBuffer(encryptedBuffer, iv, authTag);
    return {
      fileName: `contrato_${contract.reservation_id}.pdf`,
      buffer: decryptedBuffer,
    };
  }
} 