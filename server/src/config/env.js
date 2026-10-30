import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must contain at least 32 characters'),
  JWT_EXPIRES_IN: z.string().regex(/^[1-9]\d*[smhd]$/, 'Use a duration such as 30m, 12h, or 7d').default('7d'),
  COOKIE_NAME: z.string().min(1).default('notesflow_session'),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().optional().default(''),
  CLIENT_URL: z.string().default('http://localhost:5173').refine(
    (value) => value.split(',').map((origin) => origin.trim()).every((origin) => z.string().url().safeParse(origin).success),
    'CLIENT_URL must contain one or more comma-separated absolute URLs',
  ),
});

let cachedConfig;

export function getConfig() {
  if (cachedConfig) return cachedConfig;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Invalid server environment:\n${details}\nSet the required values in server/.env or the project-root .env file. Start with server/.env.example.`);
  }
  cachedConfig = {
    ...parsed.data,
    allowedOrigins: [...new Set(parsed.data.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean))],
  };
  return cachedConfig;
}

export function resetConfigForTests() {
  cachedConfig = undefined;
}
