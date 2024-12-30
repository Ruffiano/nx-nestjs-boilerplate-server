import { registerAs } from '@nestjs/config';
import Joi from 'joi';

// Validation schema
const envVarsSchema = Joi.object({
  /*env*/
  NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),

  API_GATEWAY_HTTP_PORT: Joi.number().required().description('The PORT for the API Gateway HTTP server'),
  
  REDIS_HOST: Joi.string().required().description('REDIS HOST'),
  REDIS_PORT: Joi.string().required().description('REDIS PORT'),

  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  JWT_EXPIRATION_TIME: Joi.string().description('JWT expiration time in minutes'),
  JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().description('JWT access token expiration in minutes'),
  JWT_REFRESH_EXPIRATION_DAYS: Joi.number().description('JWT refresh token expiration in days'),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number().description('JWT reset password token expiration in minutes'),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number().description('JWT verify email token expiration in minutes'),
  JWT_SIGNATURE_SECRET: Joi.string().required().description('JWT signature secret'),

  SECRET_KEY: Joi.string().required().description('Secret key for encryption'),
  SECRET_IV: Joi.string().required().description('Secret IV for encryption'),

  REDIS_PASSWORD: Joi.string().required().description('REDIS PASSWORD'),
  REDIS_DB_INDEX: Joi.number().required().description('REDIS DB INDEX'),
}).unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default registerAs('config', () => ({
  env: envVars.NODE_ENV,
  app: {
    port: envVars.API_GATEWAY_HTTP_PORT,
  },
  grpc: {
    authService: {
      host: envVars.AUTH_SERVICE_HOST,
      port: envVars.AUTH_SERVICE_GRPC_PORT,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expirationTime: envVars.JWT_EXPIRATION_TIME,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    signatureSecret: envVars.JWT_SIGNATURE_SECRET,
  },
  encryption: {
    key: envVars.SECRET_KEY,
    iv: envVars.SECRET_IV,
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
    db: envVars.REDIS_DB_INDEX,
  },
}));