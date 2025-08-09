import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    //APP
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),

    PORT: Joi.number()
        .port()
        .default(3000),

    // CONTENT
    CONTENTFUL_SPACE_ID: Joi.string()
        .required(),

    CONTENTFUL_ACCESS_TOKEN: Joi.string()
        .required(),

    CONTENTFUL_ENVIRONMENT: Joi.string()
        .required(),

    CONTENTFUL_CONTENT_TYPE: Joi.string()
        .required(),


    // Base de datos
    DB_HOST: Joi.string()
        .required(),

    DB_PORT: Joi.number()
        .port()
        .default(5432),

    DB_USERNAME: Joi.string()
        .required(),

    DB_PASSWORD: Joi.string()
        .required(),

    DB_NAME: Joi.string()
        .required(),

    DB_SSL: Joi.boolean()
        .default(false),

    DB_POOL_SIZE: Joi.number()
        .default(10),

});

export function validateEnvironment(config: Record<string, unknown>) {
    const { error, value } = envValidationSchema.validate(config, {
        allowUnknown: true,
        abortEarly: false,
    });

    if (error) {
        const errorMessage = error.details
            .map((detail) => detail.message)
            .join('\n');

        throw new Error(`❌ Missing environment variables:\n${errorMessage}`);
    }

    return value;
}