import { Injectable, InternalServerErrorException } from '@nestjs/common';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { AppProvider } from '../app/app.provider';
import { MailerSettings } from './mailer.settings';

@Injectable()
export class MailerService extends AppProvider {
  private settings: MailerSettings = this.getSettings();
  private mailerTransporter: Mail;

  /** */
  public constructor() {
    super();
    this.setupMailer();
  }

  /**
   * Configures the mailer transporter
   */
  private setupMailer(): void {

    if (!this.settings.MAILER_HOST) {
      this.logger.warning('[DISABLED] Mailer transporter', { private: true });
      return undefined;
    }

    this.mailerTransporter = nodemailer.createTransport({
      host: this.settings.MAILER_HOST,
      port: this.settings.MAILER_PORT,
      secure: this.settings.MAILER_PORT === 465,
      auth: {
        user: this.settings.MAILER_USERNAME,
        pass: this.settings.MAILER_PASSWORD,
      },
    });

    this.logger.success('[ENABLED] Mailer transporter', { private: true });
  }

  /**
   * Throw if mailer transporter is not enabled
   * Used at the beggining of all methods
   */
  private checkMailerTransporter(): void {
    if (!this.mailerTransporter) {
      throw new InternalServerErrorException({
        message: 'Mailer transporter is DISABLED',
      });
    }
  }

  /**
   * Sends an email using configured transporter
   * Errors are logged but they do not interrupt the process
   * @param mailOptions
   */
  public async sendMail(mailOptions: Mail.Options): Promise<void> {
    this.checkMailerTransporter();
    this.logger.debug(`Mailer: Sending mail to ${mailOptions.to}...`);
    try {
      await this.mailerTransporter.sendMail(mailOptions);
    }
    catch (e) {
      this.logger.error(e);
    }
  }

}
