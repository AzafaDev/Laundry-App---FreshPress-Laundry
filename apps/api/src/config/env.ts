import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("8080"),
  API_URL: z.string().default("http://localhost:8080"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default("1h"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  NODEMAILER_USER: z.string().optional(),
  NODEMAILER_PASS: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  CLIENT_URL: z.string().default("http://localhost:3000"),
  ALLOWED_ORIGINS: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  OPENCAGE_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
