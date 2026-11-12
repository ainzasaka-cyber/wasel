import { loginSchema } from "@/lib/validation";
import { assertSameOrigin } from "@/lib/csrf";
import { env } from "@/lib/env";
import { errorResponse, AppError } from "@/lib/errors";
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
  try {
    assertSameOrigin(request, env.APP_URL);
    const payload = await readLoginPayload(request);
    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) throw new AppError("VALIDATION_ERROR", "Invalid login input", 422, { issues: parsed.error.issues });
    const result = await authenticateUser(prisma, parsed.data.email, parsed.data.password);
    await setSessionCookie(result.token);
    const next = typeof payload.next === "string" && payload.next.startsWith("/") && !payload.next.startsWith("//") ? payload.next : "/app";
    if (request.headers.get("accept")?.includes("text/html")) return Response.redirect(new URL(next, request.url), 303);
    return Response.json({ data: { userId: result.userId } });
  } catch (error) {
    return errorResponse(error);
  }
}
