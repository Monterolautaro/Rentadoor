import { Injectable, BadRequestException } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class EmailService {
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(
    private readonly supabaseService: SupabaseService,
  ) {
    const apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || '';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'Rentadoor';

    if (!apiKey) {
      console.warn('SENDGRID_API_KEY not found. Email service will not work.');
      return;
    }

    if (!this.fromEmail) {
      console.warn('SENDGRID_FROM_EMAIL not found. Email service will not work.');
      return;
    }

    sgMail.setApiKey(apiKey);
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    if (!process.env.SENDGRID_API_KEY || !this.fromEmail) {
      throw new BadRequestException('Email service not configured');
    }

    const msg = {
      to,
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      subject,
      text,
      html: html || `<p>${text}</p>`,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error(`Error sending email: ${error.response?.body || error.message}`);
      throw error;
    }
  }

  async getAdminEmails() {
    const { data: admins } = await this.supabaseService.getClient().from('Users').select('email').eq('rol', 'admin');
    return admins?.map(a => a.email).filter(Boolean) || [];
  }
}
