import { ValidationError } from 'class-validator';

import { MockConfig } from '../test/mock/mock.confit';
import { TestService } from '../test/test.service';
import { ConfigService } from './config.service';

TestService.createSandbox({
  name: 'ConfigService',

  descriptor: () => {
    let validationErrors: ValidationError[];

    beforeAll(async () => {
      validationErrors = await ConfigService.setupSecretEnvironment({
        envPath: `${__dirname}/../../../.env`,
        configs: [ MockConfig ],
        allowValidationErrors: true,
      });
    });

    describe('setupSecretEnvironment', () => {
      it('should populate the secret cache', () => {
        expect(validationErrors).toBeDefined();
      });
    });

    describe('getSecret', () => {
      it('should read an injected secret', () => {
        expect(ConfigService.getSecret('NODE_ENV')).toBeDefined();
      });
    });

    describe('validateConfigs', () => {
      it('should flag a configuration error', () => {
        expect(validationErrors.length).toBeGreaterThanOrEqual(1);
        expect(validationErrors[0].property).toBe('SECRET_NUMBER');
      });
    });
  },
});
