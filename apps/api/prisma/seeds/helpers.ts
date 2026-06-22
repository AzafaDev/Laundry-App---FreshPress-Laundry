import bcrypt from 'bcrypt';
import { subDays } from 'date-fns';

export const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function getRandomDateInRange(startDaysAgo: number, endDaysAgo: number): Date {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const range = startDaysAgo - endDaysAgo;
  const randomDays = Math.floor(Math.random() * (range + 1));
  return subDays(today, endDaysAgo + randomDays);
}

export function getRandomDateInAbsoluteRange(start: Date, end: Date): Date {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return new Date(startMs + Math.random() * (endMs - startMs));
}

export function formatLocalTime(date: Date | null): string | null {
  if (!date) return null;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}