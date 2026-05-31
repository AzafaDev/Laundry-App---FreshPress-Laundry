// Targeted rate-limiters used on sensitive endpoints (login, etc).
// The global limiter lives in server.ts; these are stricter per-IP guards.
import rateLimit from "express-rate-limit";

/**
 * Login attempts limiter — 10 attempts / 15 minutes per IP.
 * Mounted on POST /auth/login to mitigate password brute-forcing.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // don't penalize valid logins
  message: {
    message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
  },
});

/**
 * Generic auth limiter — 20 attempts / 15 minutes per IP.
 * Useful for register / reset-password / forgot-password endpoints.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 20 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Terlalu banyak permintaan. Coba lagi dalam beberapa menit.",
  },
});
