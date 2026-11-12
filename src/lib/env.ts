import { z } from "zod";

const optional = z.string().trim().min(1).optional();

const envSchema = z.object({
  DATABASE_URL: z.string().url().or(z.string().startsWith("postgresql://")),
  AUTH_SECRET: z.string().min(32),
  APP_URL: z.string().url(),
  TRACKING_TOKEN_SECRET: z.string().min(32),
  RATE_LIMIT_TRACKING_PER_MINUTE: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_API_PER_MINUTE: z.coerce.number().int().positive().default(600),
  RATE_LIMIT_LOGIN_PER_15_MIN: z.coerce.number().int().positive().default(20),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SHOPIFY_CLIENT_ID: optional,
  SHOPIFY_CLIENT_SECRET: optional,
  SHOPIFY_WEBHOOK_SECRET: optional,
  WOOCOMMERCE_URL: optional,
  WOOCOMMERCE_CONSUMER_KEY: optional,
  WOOCOMMERCE_CONSUMER_SECRET: optional,
  SMTP_URL: optional,
  SMTP_FROM: optional,
  SMS_API_KEY: optional,
  WHATSAPP_API_KEY: optional,
  S3_ENDPOINT: optional,
  S3_BUCKET: optional,
  S3_ACCESS_KEY_ID: optional,
  S3_SECRET_ACCESS_KEY: optional,
});

export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(input: NodeJS.ProcessEnv = process.env): AppEnv {
  return envSchema.parse(input);
}

export const env = parseEnv();
