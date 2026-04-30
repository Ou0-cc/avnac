import { z } from "zod";

import { getRuntimeEnv } from "./runtime-env";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3001"),
  CORS_ORIGIN: z.string().default("http://localhost:3300"),
  UNSPLASH_ACCESS_KEY: z.string().min(1).optional(),
  PAYSTACK_SECRET_KEY: z.string().min(1).optional(),
  PAYSTACK_CURRENCY: z
    .string()
    .trim()
    .length(3, "PAYSTACK_CURRENCY must be a 3-letter code")
    .transform((value) => value.toUpperCase())
    .default("NGN"),
});

export const env = envSchema.parse(getRuntimeEnv());

export type Env = typeof env;
