// apps/api/src/utils/pagination.ts
import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export function getSkipTake({ page, limit }: PaginationQuery) {
  return { skip: (page - 1) * limit, take: limit };
}

export function buildPagination(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
