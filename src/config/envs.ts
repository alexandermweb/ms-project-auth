import 'dotenv/config';
import * as joi from 'joi';


interface EnvVars {
  PORT: number;

  NATS_SERVERS: string[];

  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;

  JWT_SECRET: string;
}

const envsSchema = joi.object({
  PORT: joi.number().required(),

  NATS_SERVERS: joi.array().items(joi.string()).required(),

  // DB_HOST: joi.string().required(),
  DB_PORT: joi.number().required(),
  DB_USER: joi.string().required(),
  DB_PASSWORD: joi.string().required(),
  DB_NAME: joi.string().required(),

  JWT_SECRET: joi.string().required(),
})
.unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
});

if (error) throw new Error(`Config validation error: ${error.message}`);

const envVars:EnvVars = value;

export const envs = {
  port: envVars.PORT,

  natsServers: envVars.NATS_SERVERS,

  dbHost: envVars.DB_HOST,
  dbPort: envVars.DB_PORT,
  dbUser: envVars.DB_USER,
  dbPassword: envVars.DB_PASSWORD,
  dbName: envVars.DB_NAME,

  jwtSecret: envVars.JWT_SECRET,
}