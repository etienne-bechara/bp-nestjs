import { IncomingMessage } from 'http';

export class AppRequest extends IncomingMessage {
  public metadata: AppRequestMetadata;
}

export class AppRequestMetadata {
  public ip: string;
  public userAgent: string;
}
