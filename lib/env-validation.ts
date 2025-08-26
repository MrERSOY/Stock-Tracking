// lib/env-validation.ts
import { z } from "zod";

/**
 * Environment variable validation schema
 * This ensures all required env vars are present and valid
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // Authentication
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

  // App
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .optional(),

  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

type EnvSchema = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 * Throws an error if any required env var is missing or invalid
 */
export const env: EnvSchema = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      console.error("❌ Invalid environment variables:");
      missingVars.forEach((msg) => console.error(`  - ${msg}`));
      console.error(
        "\nEnsure your .env.local file contains all required variables."
      );
      throw new Error(
        `Environment validation failed: ${missingVars.join(", ")}`
      );
    }
    throw error;
  }
})();

/**
 * Safe environment variable access
 * Returns undefined for missing optional vars instead of throwing
 */
export function safeEnv<T extends keyof EnvSchema>(
  key: T
): EnvSchema[T] | undefined {
  try {
    return env[key];
  } catch {
    return undefined;
  }
}

/**
 * Check if we're in production mode
 */
export const isProduction = env.NODE_ENV === "production";

/**
 * Check if we're in development mode
 */
export const isDevelopment = env.NODE_ENV === "development";

/**
 * Secure logging function that strips sensitive data in production
 */
export function secureLog(message: string, data?: Record<string, unknown>) {
  if (isDevelopment) {
    console.log(message, data);
    return;
  }

  // In production, only log non-sensitive information
  if (data) {
    const sanitized = Object.entries(data).reduce((acc, [key, value]) => {
      // Strip potential sensitive keys
      if (/password|secret|key|token|api|private/i.test(key)) {
        acc[key] = "[REDACTED]";
      } else if (typeof value === "string" && value.length > 100) {
        acc[key] = value.substring(0, 100) + "...";
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);

    console.log(message, sanitized);
  } else {
    console.log(message);
  }
}
