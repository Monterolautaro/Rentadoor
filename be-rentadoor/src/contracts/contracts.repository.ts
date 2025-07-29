import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { EncryptionService } from '../encryption/encryption.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ContractsRepository {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async saveContractFile(reservationId: number, file: any) {
    // 1. Encriptar el archivo
    const encrypted = this.encryptionService.encryptBuffer(file.buffer);
    const filePath = `reservation_${reservationId}/contrato_${Date.now()}.enc`;
    // 2. Subir archivo encriptado a Supabase Storage
    const supabase = this.supabaseService.getClient();
    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(filePath, encrypted.cipherText, { contentType: 'application/octet-stream', upsert: true });
    if (uploadError) throw new BadRequestException('Error subiendo contrato a storage: ' + uploadError.message);
    // 3. Guardar metadata en la tabla contracts
    const { data: contract, error: dbError } = await supabase
      .from('contracts')
      .insert([{
        reservation_id: reservationId,
        file_url: filePath,
        iv: encrypted.iv.toString('base64'),
        auth_tag: encrypted.authTag.toString('base64'),
        encryption_algorithm: encrypted.algorithm,
        key_id: encrypted.keyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select('*')
      .single();
    if (dbError) throw new BadRequestException('Error guardando metadata de contrato: ' + dbError.message);
    // 4. Obtener emails de propietario e inquilino (simulado, deberías obtenerlos de la reserva/usuarios)
    // const { ownerEmail, tenantEmail } = await ...
    // 5. Enviar email con link al contrato
    // await this.emailService.sendMail(ownerEmail, 'Nuevo contrato disponible', 'Tienes un nuevo contrato para firmar...', `<a href="${process.env.FRONTEND_URL}/contract/${contract.id}">Ver contrato</a>`);
    // await this.emailService.sendMail(tenantEmail, 'Nuevo contrato disponible', 'Tienes un nuevo contrato para firmar...', `<a href="${process.env.FRONTEND_URL}/contract/${contract.id}">Ver contrato</a>`);
    return contract;
  }

  async getContractByReservation(reservationId: number) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('reservation_id', reservationId)
      .single();
    if (error) throw new BadRequestException('Error consultando contrato: ' + error.message);
    return data;
  }
}
