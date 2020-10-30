import { UnderscoreNamingStrategy } from '@mikro-orm/core';
import dotenv from 'dotenv';

import { AppEnvironment } from '../app/app.enum';
import { UtilService } from '../util/util.service';

dotenv.config({ path: `${__dirname}/../../../.env` });

/**
 * Configuration used exclusively when executing
 * migration CLI commands.
 *
 * This is required since they run based on
 * TypeScript and not compiled output.
 */
export default {
  type: process.env.ORM_TYPE,
  host: process.env.ORM_HOST,
  port: process.env.ORM_PORT,
  user: process.env.ORM_USERNAME,
  password: process.env.ORM_PASSWORD,
  dbName: process.env.ORM_DATABASE,

  baseDir: __dirname,
  entities: UtilService.globToRequire('./**/*.entity.{ts,js}'),

  namingStrategy: UnderscoreNamingStrategy,

  migrations: {
    tableName: '_migration',
    path: `${__dirname}/../../../../migration`,
    pattern: /^[\w-]+\d+\.[jt]s$/,
    dropTables: process.env.NODE_ENV === AppEnvironment.LOCAL,
    emit: 'ts',
  },
};
