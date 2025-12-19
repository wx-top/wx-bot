import dotenv from 'dotenv'
import { validateEnv, type EnvConfig } from './schema.js';

dotenv.config();

const env = validateEnv(process.env);

export const config: EnvConfig = env;

