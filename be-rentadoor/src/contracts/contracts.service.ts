import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ContractsRepository } from './contracts.repository';
import { SupabaseService } from '../supabase/supabase.service';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class ContractsService {
  constructor(
    private readonly contractsRepository: ContractsRepository,
    private readonly supabaseService: SupabaseService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async uploadContract(file: any, reservationId: number) {
    return this.contractsRepository.saveContractFile(reservationId, file);
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