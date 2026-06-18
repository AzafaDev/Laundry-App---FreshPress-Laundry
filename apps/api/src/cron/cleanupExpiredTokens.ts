import cron from "node-cron";
import { prisma } from "../lib/prisma.js";

async function cleanupExpiredTokens() {
  const [refreshResult, resetResult] = await Promise.all([
    prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expires_at: { lt: new Date() } },
          { revoked_at: { not: null } },
        ],
      },
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expires_at: { lt: new Date() } },
          { used_at: { not: null } },
        ],
      },
    }),
  ]);

  if (refreshResult.count > 0) {
    console.log(`[Cron] Deleted ${refreshResult.count} expired/revoked refresh token(s)`);
  }
  if (resetResult.count > 0) {
    console.log(`[Cron] Deleted ${resetResult.count} expired/used password reset token(s)`);
  }
}

// Tiap hari jam 02:00 WIB (19:00 UTC)
cron.schedule("0 19 * * *", async () => {
  try {
    await cleanupExpiredTokens();
  } catch (err) {
    console.error("[Cron] cleanupExpiredTokens error:", err);
  }
}, { timezone: "UTC" });
