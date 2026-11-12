import { AppError } from "./errors";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function assertSameOrigin(request: Request, appUrl: string): void {
  if (!MUTATING_METHODS.has(request.method)) return;
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    throw new AppError("FORBIDDEN", "Cross-site mutation rejected", 403);
  }
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(appUrl).origin) {
    throw new AppError("FORBIDDEN", "Invalid request origin", 403);
  }
}
