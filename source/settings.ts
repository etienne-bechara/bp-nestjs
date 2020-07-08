import { AppSettings } from './core/app/app.settings';
import { HttpsSettings } from './core/https/https.settings';
import { LoggerSettings } from './core/logger/logger.settings';
import { MailerSettings } from './core/mailer/mailer.settings';
import { OrmSettings } from './core/orm/orm.settings';
import { RedisSettings } from './core/redis/redis.settings';

/**
 * Helper type to join all the available settings
 * components from application
 *
 * Every time you add a new domain with custom settings,
 * add its type here for reference
 */
export type Settings =
  AppSettings
  & HttpsSettings
  & LoggerSettings
  & MailerSettings
  & OrmSettings
  & RedisSettings
;
