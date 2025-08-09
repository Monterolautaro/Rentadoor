import { Controller, Post, Body, Param, Get, Logger } from '@nestjs/common';
import { DocusignService } from './docusign.service';
import { ContractsRepository } from '../contracts/contracts.repository';

@Controller('api/docusign')
export class DocuSignController {
  private readonly logger = new Logger(DocuSignController.name);
  constructor(private readonly ds: DocusignService, private readonly contractsRepository: ContractsRepository) {}


  @Post('envelopes')
  async createEnvelope(@Body() body: { reservationId: number; signers: Array<{ name: string; email: string }> }) {
    const { reservationId, signers } = body;
    const response = await this.ds.createEnvelope(signers, reservationId);
    return response;
  }

  @Get('envelopes/:envelopeId/download')
  async download(@Param('envelopeId') envelopeId: string) {
    const out = `/tmp/${envelopeId}.pdf`;
    await this.ds.downloadCombinedDocument(envelopeId, out);
    return { path: out };
  }
  
  @Post('envelopes/:envelopeId/recipient-view')
  async createRecipientView(@Param('envelopeId') envelopeId: string, @Body() body: { signer: { name: string; email: string; clientUserId: string }; returnUrl: string }) {
    const { signer, returnUrl } = body;
    const url = await this.ds.createRecipientView(envelopeId, signer, returnUrl);
    return { url };
  }


  @Post('webhook')
  async docusignWebhook(@Body() body: any) {
    try {

      const data = body.data || {};
      const envelopeId = body.envelopeId || body.envelope_id || data.envelopeId || data.envelope_id;
      const event = body.event || data.event;
      const envelopeSummary = data.envelopeSummary || {};
      const status = envelopeSummary.status || data.status;

      const supabase = this.contractsRepository['supabaseService'].getClient();
      const { data: contract } = await supabase.from('contracts').select('*').eq('envelope_id', envelopeId).single();
      if (!contract) return { ok: false };
      await this.contractsRepository.updateSignatureFields(contract.reservation_id, {
        signature_status: status,
      });
      // Si el envelope está completado, descargar y guardar el PDF firmado
      if (status === 'completed') {
        const out = `/tmp/${envelopeId}.pdf`;
        await this.ds.downloadCombinedDocument(envelopeId, out);
        const signedPdfUrl = await this.ds.handleSignedContract(contract.reservation_id, envelopeId, out);
        await this.contractsRepository.updateSignatureFields(contract.reservation_id, {
          signature_status: 'completed',
          signed_pdf_url: signedPdfUrl,
        });
    
        const { data: reservation } = await supabase.from('reservations').select('*').eq('id', contract.reservation_id).single();
        if (reservation) {
          const { data: tenant } = await supabase.from('Users').select('email,nombre,name').eq('id', reservation.user_id).single();
          const { data: owner } = await supabase.from('Users').select('email,nombre,name').eq('id', reservation.owner_id).single();
          const emailService = this.ds['emailService'];
          const html = `<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\"><h2 style=\"color: #2563eb;\">Contrato firmado</h2><p>Hola,</p><p>El contrato de alquiler ha sido firmado por ambas partes. Puedes descargar el contrato firmado aquí:</p><p><a href=\"${signedPdfUrl}\" style=\"display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;\">Descargar contrato firmado</a></p><hr style=\"margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;\"><p style=\"font-size: 14px; color: #64748b;\">Equipo de Rentadoor</p></div>`;
          if (tenant?.email) await emailService.sendMail(tenant.email, 'Contrato firmado', 'El contrato ha sido firmado por ambas partes.', html);
          if (owner?.email) await emailService.sendMail(owner.email, 'Contrato firmado', 'El contrato ha sido firmado por ambas partes.', html);
        }
      }
      return { ok: true };
    } catch (err) {
      this.logger.error('Error en webhook de DocuSign');
      this.logger.error(err);
      return { ok: false, error: err?.message };
    }
  }
 
}
