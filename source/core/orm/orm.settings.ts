import { Connection, IDatabaseDriver, Options, UnderscoreNamingStrategy } from 'mikro-orm';

import { AppEnvironment } from '../app/app.enum';
import { AppUtils } from '../app/app.utils';

const settings = AppUtils.getSettings();
const entities = AppUtils.globToRequire('../../**/*.entity.js');

const isDevelopment = settings.NODE_ENV === AppEnvironment.DEVELOPMENT;

const OrmSettings: Options<IDatabaseDriver<Connection>> = {

  type: settings.APP_ORM_TYPE,
  host: settings.APP_ORM_HOST,
  port: settings.APP_ORM_PORT,
  user: settings.APP_ORM_USERNAME,
  password: settings.APP_ORM_PASSWORD,
  dbName: settings.APP_ORM_DATABASE,

  pool: {
    min: settings.APP_ORM_POOL_MIN,
    max: settings.APP_ORM_POOL_MAX,
  },

  autoFlush: false,
  entities,

  logger: (msg): void => AppUtils.getLogger().debug(`MikroORM ${msg}`),
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
