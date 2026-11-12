import { AppError } from "./errors";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export function parsePagination(searchParams: URLSearchParams): { limit: number; cursor?: string } {
  const rawLimit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
  if (!Number.isInteger(rawLimit) || rawLimit < 1 || rawLimit > MAX_LIMIT) throw new AppError("VALIDATION_ERROR", `limit must be between 1 and ${MAX_LIMIT}`, 422);
  const cursor = searchParams.get("cursor") ?? undefined;
  if (cursor && cursor.length > 256) throw new AppError("VALIDATION_ERROR", "cursor is too long", 422);
  return { limit: rawLimit, ...(cursor ? { cursor } : {}) };
}

export function page<T>(rows: T[], limit: number, getCursor: (row: T) => string) {
  const hasMore = rows.length > limit;
  const data = rows.slice(0, limit);
  const last = data[data.length - 1];
  return { data, page: { nextCursor: hasMore && last ? getCursor(last) : null, hasMore, limit } };
}
