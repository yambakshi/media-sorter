import development from './development';
import production from './production';

const envFile = process.env.NODE_ENV || 'development';
const envs = { development, production };

export const env = envs[envFile];