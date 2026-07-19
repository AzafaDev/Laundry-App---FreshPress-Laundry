import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().trim().default("8080"),
  API_URL: z.string().trim().default("http://localhost:8080"),
  DATABASE_URL: z.string().trim(),
  JWT_SECRET: z.string().trim(),
  JWT_REFRESH_SECRET: z.string().trim(),
  JWT_EXPIRES_IN: z.string().trim().default("1h"),
  JWT_REFRESH_EXPIRES_IN: z.string().trim().default("7d"),
  NODEMAILER_USER: z.string().trim().optional(),
  NODEMAILER_PASS: z.string().trim().optional(),
  RESEND_API_KEY: z.string().trim().optional(),
  CLIENT_URL: z.string().trim().default("http://localhost:3000"),
  ALLOWED_ORIGINS: z.string().trim().optional(),
  GOOGLE_CLIENT_ID: z.string().trim().optional(),
  GOOGLE_CLIENT_SECRET: z.string().trim().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().trim().optional(),
  CLOUDINARY_API_KEY: z.string().trim().optional(),
  CLOUDINARY_API_SECRET: z.string().trim().optional(),
  OPENCAGE_API_KEY: z.string().trim().optional(),
});

export const env = envSchema.parse(process.env);
