import { Injectable, Logger } from '@nestjs/common';
import * as docusign from 'docusign-esign';
import * as fs from 'fs';
import axios from 'axios';
import { ContractsRepository } from '../contracts/contracts.repository';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from 'src/email/email.service';

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
        private readonly contractsRepository: ContractsRepository,
        private readonly supabaseService: SupabaseService,
        private readonly emailService: EmailService,
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

    private async getBase64FromUrl(url: string) {
        const resp = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(resp.data).toString('base64');
    }


    async createEnvelope(reservationId: number) {
        const accessToken = await this.getAccessToken();
        this.apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

        const envelopesApi = new docusign.EnvelopesApi(this.apiClient);


        const contract = await this.contractsRepository.getContractByReservation(reservationId);

        if (!contract || !contract.file_url) throw new Error('Contrato no encontrado para la reserva');
        const fileUrl = contract.file_url;

        const supabase = this.supabaseService.getClient();
        const { data: reservation, error: reservationError } = await supabase
            .from('reservations')
            .select('*')
            .eq('id', reservationId)
            .single();

        if (reservationError || !reservation) throw new Error('Reserva no encontrada');

        const { data: tenant } = await supabase.from('Users').select('email,nombre').eq('id', reservation.user_id).single();

        const { data: owner } = await supabase.from('Users').select('email,nombre').eq('id', reservation.owner_id).single();

        if (!tenant || !owner) throw new Error('No se encontraron los usuarios firmantes');


        const bothSigners = [
            {
                name: tenant.nombre,
                email: tenant.email,
                clientUserId: reservation.user_id,
                recipientId: '1',
                routingOrder: '1',
            },
            {
                name: owner.nombre,
                email: owner.email,
                clientUserId: reservation.owner_id,
                recipientId: '2',
                routingOrder: '2',
            }
        ];

        const { data, error } = await supabase.storage
            .from('contracts')
            .download(fileUrl);
        if (error) throw new Error('Error descargando contrato desde storage: ' + error.message);
        const buffer = Buffer.from(await data.arrayBuffer());
        const documentBase64 = buffer.toString('base64');

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
                signers: bothSigners,
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

        await this.contractsRepository.updateSignatureFields(reservationId, {
            envelope_id: result.envelopeId,
            tenant_client_user_id: bothSigners[0]?.clientUserId,
            owner_client_user_id: bothSigners[1]?.clientUserId,
            signature_status: 'pending',
        });

        return { envelopeId: result.envelopeId, signers: bothSigners };
    }


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

        if (!viewRequest) throw new Error('Error al crear la vista de firma');

        const response = await envelopesApi.createRecipientView(this.accountId, envelopeId, { recipientViewRequest: viewRequest });

        if (!response) throw new Error('No se pudo crear la vista de firma');

        return response.url;
    }

    async downloadCombinedDocument(envelopeId: string, outputPath: string) {
        const accessToken = await this.getAccessToken();
        this.apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
        const envelopesApi = new docusign.EnvelopesApi(this.apiClient);

        const result = await envelopesApi.getDocument(this.accountId, envelopeId, 'combined');

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

    async sendEmailToAdmins(envelopeId: string) {

        const adminEmails = await this.emailService.getAdminEmails();
        for (const email of adminEmails) {
            await this.emailService.sendMail(
                email,
                'Nuevo contrato firmado',
                'Se ha firmado un nuevo contrato.',
                `<p>El contrato ${envelopeId}, ya se encuentra firmado por ambas partes. Revisa el panel de administración para más detalles.</p>`
            );
        }

    }
}
