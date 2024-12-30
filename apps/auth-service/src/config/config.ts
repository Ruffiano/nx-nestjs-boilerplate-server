import { registerAs } from '@nestjs/config';
import Joi from 'joi';

// Validation schema
const envVarsSchema = Joi.object({
  /*env*/
  NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),

  AUTH_SERVICE_HOST: Joi.string().required().description('The HOST for the Auth Manager gRPC server'),
  AUTH_SERVICE_GRPC_PORT: Joi.number().required().description('The PORT for the Auth Manager gRPC server'),
  
  AUTH_SERVICE_DB_NAME: Joi.string().required().description('The name of the database'),
  POSTGRES_HOST: Joi.string().required().description('The host of the database'),
  POSTGRES_PORT: Joi.number().required().description('The port of the database'),
  POSTGRES_USER: Joi.string().required().description('The user of the database'),
  POSTGRES_PASSWORD: Joi.string().required().description('The password of the database'),
  
  KAFKA_BROKER_CLUSTER_1: Joi.string().description('KAFKA BROKER CLUSTER_1'),
  KAFKA_BROKER_CLUSTER_2: Joi.string().description('KAFKA BROKER CLUSTER_2'),
  KAFKA_BROKER_CLUSTER_3: Joi.string().description('KAFKA BROKER CLUSTER_3'),
  AUTH_SERVICE_KAFKA_CLIENT_ID: Joi.string().required().description('Kafka server client ID'),
  AUTH_SERVICE_KAFKA_GROUP_ID: Joi.string().required().description('Kafka server group ID'),

  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  JWT_EXPIRATION_TIME: Joi.string().description('JWT expiration time in minutes'),
  JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().description('JWT access token expiration in minutes'),
  JWT_REFRESH_EXPIRATION_DAYS: Joi.number().description('JWT refresh token expiration in days'),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number().description('JWT reset password token expiration in minutes'),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number().description('JWT verify email token expiration in minutes'),
  JWT_SIGNATURE_SECRET: Joi.string().required().description('JWT signature secret key'),
  
  TOTP_SECRET: Joi.string().required().description('TOTP secret key for OTP generation'),

  SECRET_KEY: Joi.string().required().description('Secret key for encryption'),
  SECRET_IV: Joi.string().required().description('Secret IV for encryption'),
  
  REDIS_HOST: Joi.string().required().description('REDIS HOST'),
  REDIS_PORT: Joi.string().required().description('REDIS PORT'),
  REDIS_PASSWORD: Joi.string().required().description('REDIS PASSWORD'),
  REDIS_DB_INDEX: Joi.number().required().description('REDIS DB INDEX'),
}).unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Auth config validation error: ${error.message}`);
}

export default registerAs('config', () => ({
  env: envVars.NODE_ENV,
  
  grpc: {
    authService: {
      host: envVars.AUTH_SERVICE_HOST,
      port: envVars.AUTH_SERVICE_GRPC_PORT,
    },
  },
  database: {
    name: envVars.AUTH_SERVICE_DB_NAME,
    host: envVars.POSTGRES_HOST,
    port: envVars.POSTGRES_PORT,
    user: envVars.POSTGRES_USER,
    password: envVars.POSTGRES_PASSWORD,
  },
  kafka: {
    brokerCluster: [envVars.KAFKA_BROKER_CLUSTER_1, envVars.KAFKA_BROKER_CLUSTER_2, envVars.KAFKA_BROKER_CLUSTER_3],
    clientId: envVars.AUTH_SERVICE_KAFKA_CLIENT_ID,
    groupId: envVars.AUTH_SERVICE_KAFKA_GROUP_ID,
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
  totp: envVars.TOTP_SECRET,
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
