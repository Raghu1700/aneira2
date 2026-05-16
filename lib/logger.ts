import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

const redactPaths = [
  'email',
  'phone',
  '*.email',
  '*.phone',
  '*.passwordHash',
  '*.codeHash',
  '*.signature',
  '*.razorpaySignature',
  'razorpaySignature',
  'card',
  'card.*',
  'authorization',
  'cookie',
  'set-cookie',
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
];

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  redact: { paths: redactPaths, censor: '[REDACTED]' },
  base: { service: 'aneira' },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      }
    : undefined,
});

export type Logger = typeof logger;
