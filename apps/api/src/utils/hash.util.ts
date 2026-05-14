// bcrypt hash utilities
import bcrypt from "bcrypt";
import { env } from "../config/env.js";

export const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, env.BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (
  plain: string,
  hashed: string,
): Promise<boolean> => {
  return bcrypt.compare(plain, hashed);
};
