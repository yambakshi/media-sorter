import development from './development';

const envFile = process.env.NODE_ENV || 'development';
const envs = { development };

export const env = envs[envFile];