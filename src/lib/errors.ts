export type ErrorCode = "VALIDATION_ERROR" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "RATE_LIMITED" | "CONFLICT" | "INVALID_STATE_TRANSITION" | "DUPLICATE_ORDER" | "DUPLICATE_REQUEST" | "TENANT_MISMATCH" | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(public readonly code: ErrorCode, message: string, public readonly status: number, public readonly details: Record<string, unknown> = {}) {
    super(message);
    this.name = "AppError";
  }
}

export function errorResponse(error: unknown): Response {
  const appError = error instanceof AppError ? error : new AppError("INTERNAL_ERROR", "Internal server error", 500);
  return Response.json({ error: { code: appError.code, message: appError.message, details: appError.details } }, { status: appError.status });
}
