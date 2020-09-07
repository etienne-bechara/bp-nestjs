import { Connection, IDatabaseDriver, Options, UnderscoreNamingStrategy } from '@mikro-orm/core';

import { AppEnvironment } from '../app/app.enum';
import { AppSettings } from '../app/app.settings';
import { UtilService } from '../util/util.service';
import { OrmSettings } from './orm.settings';

const settings = UtilService.parseSettings<AppSettings & OrmSettings>();
const entities = UtilService.globToRequire('./**/*.entity.{ts,js}');

const isDevelopment = settings.NODE_ENV === AppEnvironment.DEVELOPMENT;

const OrmConnection: Options<IDatabaseDriver<Connection>> = {

  type: settings.ORM_TYPE,
  host: settings.ORM_HOST,
  port: settings.ORM_PORT,
  user: settings.ORM_USERNAME,
  password: settings.ORM_PASSWORD,
  dbName: settings.ORM_DATABASE,

  pool: {
    min: settings.ORM_POOL_MIN,
    max: settings.ORM_POOL_MAX,
  },

  driverOptions: {
    connection: {
      enableKeepAlive: true,
      dateStrings: [
        'DATE',
        'DATETIME',
      ],
    },
  },

  baseDir: __dirname,
  entities,

  logger: (msg): void => UtilService.getLoggerService().debug(`ORM ${msg}`),
  namingStrategy: UnderscoreNamingStrategy,
  debug: isDevelopment,

  migrations: {
    tableName: '_migration',
    path: `${__dirname}/../../../../migration`,
    pattern: /^[\w-]+\d+\.[jt]s$/,
    dropTables: isDevelopment,
    emit: 'ts',
  },
};

export default OrmConnection;
