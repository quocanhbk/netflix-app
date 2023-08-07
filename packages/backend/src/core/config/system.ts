import { Credentials, SSM } from 'aws-sdk';
import { config } from 'aws-sdk/global';
import ExpiryMap from 'expiry-map';
import memoize from 'fast-memoize';
import { zipObject } from 'lodash';
import { Injectable } from '@nestjs/common';

export enum ConfigKey {
  // aws
  AWS_REGION = 'AWS_REGION',

  // cognito
  COGNITO_REGION = 'COGNITO_REGION',
  COGNITO_USER_POOL_ID = 'COGNITO_USER_POOL_ID',
  COGNITO_CLIENT_ID = 'COGNITO_CLIENT_ID',

  // redis
  REDIS_URL = 'REDIS_URL',

  // database
  POSTGRES_URL = 'POSTGRES_URL',
  POSTGRES_TEST_URL = 'POSTGRES_TEST_URL',
  POSTGRES_SYNCHRONIZE = 'POSTGRES_SYNCHRONIZE',
}

export type CongitoConfiguration = {
  region: string;
  userPoolId: string;
  clientId: string;
};

export const SSM_MEMOIZE_TIMEOUT = 300 * 1000; // 5 minutes

@Injectable()
export class SystemConfigProvider {
  public get cognito(): Promise<CongitoConfiguration> {
    return this.getBatch([
      ConfigKey.COGNITO_REGION,
      ConfigKey.COGNITO_USER_POOL_ID,
      ConfigKey.COGNITO_CLIENT_ID,
    ]).then((values) => ({
      region:
        values[ConfigKey.COGNITO_REGION] ?? this.getEnv(ConfigKey.AWS_REGION),
      userPoolId: values[ConfigKey.COGNITO_USER_POOL_ID],
      clientId: values[ConfigKey.COGNITO_CLIENT_ID],
    }));
  }

  public get postgresSynchronize() {
    return this.getEnv(ConfigKey.POSTGRES_SYNCHRONIZE, 'false');
  }

  public getPostgresUrl() {
    return this.isTest
      ? this.getEnv(ConfigKey.POSTGRES_TEST_URL)
      : this.getEnv(ConfigKey.POSTGRES_URL);
  }

  public getRedisUrl() {
    return this.getEnv(ConfigKey.REDIS_URL);
  }

  public get isProduction() {
    return this.getEnv('NODE_ENV', 'development') === 'production';
  }

  public get isTest() {
    return this.getEnv('NODE_ENV', 'development') === 'test';
  }

  public get isDebugging() {
    return !!this.getEnv('DEBUG');
  }

  public get port(): number {
    return parseInt(this.getEnv('PORT', '3001'), 10);
  }

  public get enableSwagger() {
    return !this.isTest && (!this.isProduction || this.isDebugging);
  }

  public get awsCredentials(): Promise<Credentials> {
    return new Promise((resolve, reject) => {
      config.getCredentials((err, credentials) => {
        if (err) {
          reject(err);
        } else if (typeof (credentials as Credentials).get === 'function') {
          resolve(credentials as Credentials);
        } else {
          resolve(new Credentials(credentials));
        }
      });
    });
  }

  public getEnv(key: string, defaultValue?: string) {
    return process.env[key] || defaultValue;
  }

  public async get(key: string): Promise<string> {
    let value = this.getEnv(key);

    if (typeof value === 'string' && value.startsWith('ssm:')) {
      const ssmKey = value.slice(4);
      const ssmResults = await this.getSSM([ssmKey]);
      value = ssmResults[ssmKey];
    }

    return value;
  }

  public async getBatch(keys: string[]): Promise<Record<string, string>> {
    return Promise.all(keys.map((key) => this.getEnv(key))).then(
      async (values) => {
        const results = zipObject(keys, values);
        const ssmKeys = values
          .map((value, idx) =>
            typeof value === 'string' && value.startsWith('ssm:')
              ? keys[idx]
              : undefined,
          )
          .filter((key) => !!key);

        if (ssmKeys.length) {
          const ssmKeyRevertMap = ssmKeys.reduce<Record<string, string>>(
            (all, key) => ({ ...all, [results[key].slice(4)]: key }),
            {},
          );

          const ssmResults = await this.getSSM(Object.keys(ssmKeyRevertMap));
          Object.keys(ssmKeyRevertMap).forEach((key) => {
            results[ssmKeyRevertMap[key]] = ssmResults[key];
          });
        }

        return results;
      },
    );
  }

  // memoize results for 5mins
  private getSSM = memoize(this._getSSM.bind(this), {
    cache: {
      create: () => new ExpiryMap(SSM_MEMOIZE_TIMEOUT),
    },
  });

  private async _getSSM(ssmKeys: string[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    const credentials = await Promise.resolve(this.awsCredentials);
    const ssm = new SSM({
      credentials,
      region: this.getEnv(ConfigKey.AWS_REGION),
    });
    const res = await ssm
      .getParameters({
        Names: ssmKeys, // remove ssm:
        WithDecryption: true,
      })
      .promise();

    if (res.InvalidParameters?.length) {
      throw new Error(
        `Failed to fetch parameters from SSM: ${res.InvalidParameters}`,
      );
    }

    res.Parameters.forEach((value) => {
      results[value.Name] = value.Value;
    });

    return results;
  }
}

const systemConfig = new SystemConfigProvider();

export default systemConfig;
