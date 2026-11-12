import { loginSchema } from "@/lib/validation";
import { assertSameOrigin } from "@/lib/csrf";
import { env } from "@/lib/env";
import { errorResponse, AppError } from "@/lib/errors";
import { requestIdFrom, withRequestId } from "@/lib/request-id";
import { loginRateLimiter } from "@/lib/rate-limit";
import { authenticateUser } from "@/modules/auth/service";
import { setSessionCookie } from "@/modules/auth/session";
import { prisma } from "@/lib/db";

async function readLoginPayload(request: Request): Promise<{ email: unknown; password: unknown; next?: string }> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    return { email: form.get("email"), password: form.get("password"), next: typeof form.get("next") === "string" ? String(form.get("next")) : undefined };
  }
  return request.json();
}

export async function POST(request: Request) {
  const requestId = requestIdFrom(request);
  try {
    assertSameOrigin(request, env.APP_URL);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rate = loginRateLimiter.check(ip, 12, 60_000);
    const payload = await readLoginPayload(request);
    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) throw new AppError("VALIDATION_ERROR", "Invalid login input", 422, { issues: parsed.error.issues });
    const result = await authenticateUser(prisma, parsed.data.email, parsed.data.password);
    await setSessionCookie(result.token);
    const next = typeof payload.next === "string" && payload.next.startsWith("/") && !payload.next.startsWith("//") ? payload.next : "/app";
    if (request.headers.get("accept")?.includes("text/html")) {
      const response = Response.redirect(new URL(next, request.url), 303);
      response.headers.set("X-RateLimit-Remaining", String(rate.remaining));
      return withRequestId(response, requestId);
    }
    return withRequestId(Response.json({ data: { userId: result.userId } }, { headers: { "X-RateLimit-Remaining": String(rate.remaining) } }), requestId);
  } catch (error) {
    return withRequestId(errorResponse(error), requestId);
  }
}
