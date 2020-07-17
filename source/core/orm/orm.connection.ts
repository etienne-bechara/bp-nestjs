import { Connection, IDatabaseDriver, Options, UnderscoreNamingStrategy } from 'mikro-orm';
import { MySqlDriver } from 'mikro-orm/dist/drivers/MySqlDriver';

import { AppEnvironment } from '../app/app.enum';
import { AppSettings } from '../app/app.settings';
import { AppUtils } from '../app/app.utils';
import { OrmSettings } from './orm.settings';

const settings = AppUtils.parseSettings<AppSettings & OrmSettings>();
const entities = AppUtils.globToRequire('../../**/*.entity.js');

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

  driver: MySqlDriver,
  driverOptions: {
    connection: { enableKeepAlive: true },
  },

  autoFlush: false,

  baseDir: __dirname,
  entities,

  logger: (msg): void => AppUtils.getLogger().debug(`ORM ${msg}`),
  namingStrategy: UnderscoreNamingStrategy,
  debug: isDevelopment,

  cache: {
    pretty: true,
    options: {
      cacheDir: `${__dirname}/cache`,
    },
  },

  migrations: {
    tableName: 'app_migration',
    path: `${__dirname}/../../../migration`,
    pattern: /^[\w-]+\d+\.[tj]s$/,
    dropTables: isDevelopment,
    emit: 'js',
  },
};

export default OrmConnection;
