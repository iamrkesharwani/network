import { env } from '../config/env.js';

const url = new URL(env.REDIS_URI);

export const bullMqConnection = {
  host: url.hostname,
  port: Number(url.port) || 6379,
  ...(url.password ? { password: decodeURIComponent(url.password) } : {}),
  ...(url.username ? { username: decodeURIComponent(url.username) } : {}),
  ...(url.protocol === 'rediss:' ? { tls: {} } : {}),
};
