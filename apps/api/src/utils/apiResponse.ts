// apps/api/src/utils/apiResponse.ts
// Uniform success-response envelope used by all controllers.
import type { Response } from 'express';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ok<T>(res: Response, data: T, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function paginated<T>(
  res: Response,
  data: T[],
  pagination: Pagination,
  message = 'OK',
) {
  return res.status(200).json({ success: true, message, data, pagination });
}

export function created<T>(res: Response, data: T, message = 'Created') {
  return ok(res, data, message, 201);
}

export function noContent(res: Response) {
  return res.status(204).send();
}
