import "dotenv/config";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const env = {
  NODE_ENV: optionalEnv("NODE_ENV", "development"),
  PORT: Number(optionalEnv("PORT", "3001")),
  HOST: optionalEnv("HOST", "0.0.0.0"),
  DATABASE_URL: requireEnv("DATABASE_URL"),
  JWT_SECRET: requireEnv("JWT_SECRET"),

  CORS_ORIGIN: optionalEnv("CORS_ORIGIN", "http://localhost:3000"),
  CORS_ORIGIN_REGEX: optionalEnv("CORS_ORIGIN_REGEX", ""),

  RATE_LIMIT_MAX: Number(optionalEnv("RATE_LIMIT_MAX", "100")),
  RATE_LIMIT_TIME_WINDOW: optionalEnv("RATE_LIMIT_TIME_WINDOW", "1 minute"),
  RATE_LIMIT_AUTH_MAX: Number(optionalEnv("RATE_LIMIT_AUTH_MAX", "10")),
  RATE_LIMIT_AUTH_TIME_WINDOW: optionalEnv("RATE_LIMIT_AUTH_TIME_WINDOW", "1 minute"),
} as const;
