import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

export class MailerSettings {

  /* Environment Variables */

  @IsOptional()
  @IsUrl()
  public MAILER_HOST: string;

  @ValidateIf((o) => !!o.MAILER_HOST)
  @Transform((v) => parseInt(v))
  @IsNumber()
  public MAILER_PORT: number;

  @ValidateIf((o) => !!o.MAILER_HOST)
  @IsString() @IsNotEmpty()
  public MAILER_USERNAME: string;

  @ValidateIf((o) => !!o.MAILER_HOST)
  @IsString() @IsNotEmpty()
  public MAILER_PASSWORD: string;

  /* Provider Options */

}
