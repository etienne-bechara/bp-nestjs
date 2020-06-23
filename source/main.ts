/* eslint-disable no-console */
/* eslint-disable simple-import-sort/sort */

// Validates environment variables and export a global settings object
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import dotenv from 'dotenv';
import { Settings } from './settings';

const rawEnv = dotenv.config({ path: `${__dirname}/../.env` }).parsed || { };
export const settings = plainToClass(Settings, rawEnv);

validateOrReject(settings, {
  validationError: { target: false },
})
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

// Instantiate a global logger service
import { LoggerService } from './_logger/logger.service';
export const logger = new LoggerService(settings);

// Boots the server
import { AppService } from './_app/app.service';
const appService = new AppService(settings, logger);
appService.bootServer();
