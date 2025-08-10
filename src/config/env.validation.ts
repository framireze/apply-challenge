import * as Joi from 'joi';

export interface EnvVars {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  SECRET_KEY: string;

  CONTENTFUL_SPACE_ID: string;
  CONTENTFUL_ACCESS_TOKEN: string;
  CONTENTFUL_ENVIRONMENT: string;
  CONTENTFUL_CONTENT_TYPE: string;

  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_SSL: boolean;
  DB_POOL_SIZE: number;
}

export const envValidationSchema: Joi.ObjectSchema<EnvVars> =
  Joi.object<EnvVars>({
    //APP
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),

    PORT: Joi.number().port().default(3000),

    SECRET_KEY: Joi.string().required(),

    // CONTENT
    CONTENTFUL_SPACE_ID: Joi.string().required(),

    CONTENTFUL_ACCESS_TOKEN: Joi.string().required(),

    CONTENTFUL_ENVIRONMENT: Joi.string().required(),

    CONTENTFUL_CONTENT_TYPE: Joi.string().required(),

    // Base de datos
    DB_HOST: Joi.string().required(),

    DB_PORT: Joi.number().port().default(5432),

    DB_USERNAME: Joi.string().required(),

    DB_PASSWORD: Joi.string().required(),

    DB_NAME: Joi.string().required(),

    DB_SSL: Joi.boolean().default(false),

    DB_POOL_SIZE: Joi.number().default(10),
  });

export function validateEnvironment(config: Record<string, unknown>): EnvVars {
  const validation: Joi.ValidationResult<EnvVars> =
    envValidationSchema.validate(config, {
      allowUnknown: true,
      abortEarly: false,
    });

  if (validation.error) {
    const errorMessage = validation.error.details
      .map((detail) => detail.message)
      .join('\n');

    throw new Error(`❌ Missing environment variables:\n${errorMessage}`);
  }

  return validation.value;
}
