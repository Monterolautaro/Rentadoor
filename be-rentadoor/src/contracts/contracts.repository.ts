import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class ContractsRepository {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async saveContractFile(reservationId: number, file: any) {
    const filePath = `reservation_${reservationId}/contrato_${Date.now()}.pdf`;
    const supabase = this.supabaseService.getClient();
    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(filePath, file.buffer, { contentType: 'application/pdf', upsert: true });
    if (uploadError) throw new BadRequestException('Error subiendo contrato a storage: ' + uploadError.message);

    const { data: contract, error: dbError } = await supabase
      .from('contracts')
      .insert([{
        reservation_id: reservationId,
        file_url: filePath,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select('*')
      .single();
    if (dbError) throw new BadRequestException('Error guardando metadata de contrato: ' + dbError.message);
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

  async updateSignatureFields(reservationId: number, fields: Partial<{ envelope_id: string, tenant_client_user_id: string, owner_client_user_id: string, signature_status: string, signed_pdf_url: string }>) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('contracts')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('reservation_id', reservationId)
      .select('*')
      .single();
    if ((error && error.message) || !data) throw new BadRequestException('Error actualizando contrato: ' + (error?.message || 'Error desconocido'));
    return data;
  }

  async uploadSignedContract(reservationId: number, envelopeId: string, pdfBuffer: Buffer): Promise<string> {
    const supabase = this.supabaseService.getClient();
    const filePath = `reservation_${reservationId}/signed_${envelopeId}.pdf`;
    const { error } = await supabase.storage
      .from('contracts')
      .upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });
    if (error) throw new BadRequestException('Error subiendo PDF firmado a storage: ' + error.message);
    const publicUrl = `${process.env.SUPABASE_PUBLIC_URL}/storage/v1/object/public/contracts/${filePath}`;
    return publicUrl;
  }
}
