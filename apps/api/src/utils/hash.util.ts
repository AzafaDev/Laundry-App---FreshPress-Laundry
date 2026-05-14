import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../config/constants.js";

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, SALT_ROUNDS);

export const comparePassword = (plain: string, hashed: string): Promise<boolean> =>
  bcrypt.compare(plain, hashed);
