import { Injectable, InternalServerErrorException } from '@nestjs/common';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { AbstractProvider } from '../abstract/abstract.provider';
import { MailerSettings } from './mailer.settings';

@Injectable()
export class MailerService extends AbstractProvider {
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
      this.logger.warning('Mailer transporter DISABLED', { localOnly: true });
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

    this.logger.success('Mailer transporter ENABLED', { localOnly: true });
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
