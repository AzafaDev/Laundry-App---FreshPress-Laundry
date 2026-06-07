export const VERIFICATION_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
export const RESET_PASSWORD_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
export const SALT_ROUNDS = 12;
export const MAX_AVATAR_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB
export const ALLOWED_AVATAR_EXTENSIONS = ["jpg", "jpeg", "png", "gif"];
export const ALLOWED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
];
export const SHIFT_START_HOUR = 8; // 08:00
export const SHIFT_START_MINUTE = 0;
export const LATE_THRESHOLD_MINUTES = 30; // late if after 08:30
export const DEFAULT_TIMEZONE = "Asia/Jakarta";
export const CHECKIN_RADIUS_METERS =
  Number(process.env.CHECKIN_RADIUS_METERS) || 500;

export const MAX_BYPASS_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_BYPASS_PHOTO_COUNT = 5;
export const ALLOWED_BYPASS_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
