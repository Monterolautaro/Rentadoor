import { Injectable, Logger } from '@nestjs/common';
import * as docusign from 'docusign-esign';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import axios from 'axios';
import { ContractsRepository } from '../contracts/contracts.repository';

@Injectable()
export class DocusignService {
  private readonly logger = new Logger(DocusignService.name);
  private apiClient: docusign.ApiClient;

  private integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY!;
  private userId = process.env.DOCUSIGN_USER_ID!; // userId GUID to impersonate
  private accountId = process.env.DOCUSIGN_ACCOUNT_ID!;
  private privateKey = (process.env.DOCUSIGN_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  private basePath = process.env.DOCUSIGN_BASE_PATH || 'https://demo.docusign.net/restapi';
  private oauthBase = process.env.DOCUSIGN_OAUTH_BASE || 'account-d.docusign.com';

  constructor(
    private readonly contractsRepository: ContractsRepository
  ) {
    this.apiClient = new docusign.ApiClient();
    this.apiClient.setBasePath(this.basePath);
    this.apiClient.setOAuthBasePath(this.oauthBase);
  }

  /** Genera access_token vía JWT Grant */
  async getAccessToken(): Promise<string> {
    const jwtLifeSec = 10 * 60; // 10 minutos
    const scopes = ['signature', 'impersonation'];

    const results = await this.apiClient.requestJWTUserToken(
      this.integrationKey,
      this.userId,
      scopes,
      Buffer.from(this.privateKey),
      jwtLifeSec
    );

    const accessToken = (results && (results as any).body && (results as any).body.access_token)
      ? (results as any).body.access_token
      : (results as any).accessToken ?? null;

    if (!accessToken) {
      this.logger.error('No se pudo obtener access token vía JWT');
      throw new Error('No access token');
    }

    return accessToken;
  }

  /** Convierte PDF en URL (lee desde tu storage público) a base64 */
  private async getBase64FromUrl(url: string) {
    const resp = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(resp.data).toString('base64');
  }

  
  async createEnvelope(signers: Array<{ name: string; email: string; clientUserId?: string }>, reservationId: number) {
    const accessToken = await this.getAccessToken();
    this.apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

    const envelopesApi = new docusign.EnvelopesApi(this.apiClient);

    // Buscar el contrato por reservationId y obtener el file_url
    const contract = await this.contractsRepository.getContractByReservation(reservationId);
    if (!contract || !contract.file_url) throw new Error('Contrato no encontrado para la reserva');
    const fileUrl = contract.file_url;

    // Descargar el PDF desde Supabase Storage
    const supabase = this.contractsRepository['supabaseService'].getClient();
    const { data, error } = await supabase.storage
      .from('contracts')
      .download(fileUrl);
    if (error) throw new Error('Error descargando contrato desde storage: ' + error.message);
    const buffer = Buffer.from(await data.arrayBuffer());
    const documentBase64 = buffer.toString('base64');

    // Asegurá clientUserId para embedded signing
    const signedSigners = signers.map((s, idx) => ({
      name: s.name,
      email: s.email,
      recipientId: (idx + 1).toString(),
      routingOrder: (idx + 1).toString(),
      clientUserId: s.clientUserId || uuidv4(),
    }));

    const envelopeDefinition: any = {
      emailSubject: 'Por favor firme el contrato - Rentadoor',
      documents: [
        {
          documentBase64,
          name: 'Contrato.pdf',
          fileExtension: 'pdf',
          documentId: '1',
        },
      ],
      recipients: {
        signers: signedSigners.map(s => ({
          email: s.email,
          name: s.name,
          recipientId: s.recipientId,
          routingOrder: s.routingOrder,
          clientUserId: s.clientUserId,
        })),
      },
      status: 'sent',
      eventNotification: {
        url: process.env.DOCUSIGN_WEBHOOK_URL,
        loggingEnabled: true,
        requireAcknowledgment: true,
        useSoapInterface: false,
        includeDocuments: true,
        includeEnvelopeVoidReason: true,
        includeTimeZone: true,
        includeSenderAccountAsCustomField: true,
        includeDocumentFields: true,
        includeCertificateOfCompletion: true,
        envelopeEvents: [
          { envelopeEventStatusCode: 'completed' },
          { envelopeEventStatusCode: 'sent' },
          { envelopeEventStatusCode: 'delivered' },
          { envelopeEventStatusCode: 'declined' },
          { envelopeEventStatusCode: 'voided' }
        ],
        recipientEvents: [
          { recipientEventStatusCode: 'Completed' },
          { recipientEventStatusCode: 'Sent' },
          { recipientEventStatusCode: 'Delivered' },
          { recipientEventStatusCode: 'Declined' }
        ]
      }
    };

    const result = await envelopesApi.createEnvelope(this.accountId, { envelopeDefinition });

    // Guardar en contracts
    await this.contractsRepository.updateSignatureFields(reservationId, {
      envelope_id: result.envelopeId,
      tenant_client_user_id: signedSigners[0]?.clientUserId,
      owner_client_user_id: signedSigners[1]?.clientUserId,
      signature_status: 'pending',
    });

    return { envelopeId: result.envelopeId, signers: signedSigners };
  }

  /**
   * Obtiene recipient view (URL de firma embebida) para un signer ya incluido en el envelope.
   * returnUrl: a dónde vuelve el usuario después de firmar (tu app)
   */
  async createRecipientView(envelopeId: string, signer: { name: string; email: string; clientUserId: string }, returnUrl: string) {
    const accessToken = await this.getAccessToken();
    this.apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
    const envelopesApi = new docusign.EnvelopesApi(this.apiClient);

    const viewRequest = docusign.RecipientViewRequest.constructFromObject({
      returnUrl,
      authenticationMethod: 'none',
      email: signer.email,
      userName: signer.name,
      clientUserId: signer.clientUserId,
    });

    const response = await envelopesApi.createRecipientView(this.accountId, envelopeId, { recipientViewRequest: viewRequest });
    return response.url;
  }

  /** Descarga documento combinado (todos los documentos) y lo guarda en path */
  async downloadCombinedDocument(envelopeId: string, outputPath: string) {
    const accessToken = await this.getAccessToken();
    this.apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
    const envelopesApi = new docusign.EnvelopesApi(this.apiClient);

    const result = await envelopesApi.getDocument(this.accountId, envelopeId, 'combined');
    // result es un buffer binario (en SDK puede venir como string/Buffer)
    fs.writeFileSync(outputPath, Buffer.from(result, 'binary'));
    return outputPath;
  }

  async handleSignedContract(reservationId: number, envelopeId: string, pdfPath: string): Promise<string> {
    const fs = require('fs');
    let pdfBuffer;
    try {
      pdfBuffer = fs.readFileSync(pdfPath);
    } catch (err) {
      this.logger.error('No se pudo leer el PDF firmado desde el disco', err);
      throw new Error('No se pudo leer el PDF firmado');
    }
    try {
      const url = await this.contractsRepository.uploadSignedContract(reservationId, envelopeId, pdfBuffer);
      return url;
    } catch (err) {
      this.logger.error('Error subiendo PDF firmado a storage', err);
      throw err;
    }
  }
}
