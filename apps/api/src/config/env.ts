const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
] as const

/**
 * Fails fast at boot if required secrets/config are missing, instead of
 * letting the server start and every request that touches them blow up
 * with a confusing 500 (e.g. `jwt.sign` throwing on an undefined secret).
 */
export function assertRequiredEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key])
  if (missing.length > 0) {
    console.error(
      `[startup] Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Check apps/api/.env against .env.example.',
    )
    process.exit(1)
  }
}
