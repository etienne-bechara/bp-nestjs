import { Connection, IDatabaseDriver, Options, UnderscoreNamingStrategy } from 'mikro-orm';

import { AppEnvironment } from '../app/app.enum';
import { AppUtils } from '../app/app.utils';

const settings = AppUtils.getSettings();
const entities = AppUtils.globToRequire('../../**/*.entity.js');

const isDevelopment = settings.NODE_ENV === AppEnvironment.DEVELOPMENT;

const OrmSettings: Options<IDatabaseDriver<Connection>> = {

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

  autoFlush: false,
  entities,

  logger: (msg): void => AppUtils.getLogger().debug(`ORM ${msg}`),
  namingStrategy: UnderscoreNamingStrategy,
  debug: isDevelopment,

  cache: {
    pretty: true,
    options: {
      cacheDir: isDevelopment ? 'dist/cache' : 'cache',
    },
  },

  migrations: {
    tableName: 'app_migration',
    path: isDevelopment ? 'dist/migration' : 'migration',
    pattern: /^[\w-]+\d+\.[tj]s$/,
    dropTables: isDevelopment,
    emit: 'js',
  },
};

export default OrmSettings;
