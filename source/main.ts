import { AppService } from './_app/app.service';

/**
 * Join env variables with app configuration and
 * boots the server
 */
const appService = new AppService();
appService.loadSettings();

export const settings = appService.settings;
export const logger = appService.logger;
appService.bootServer();
