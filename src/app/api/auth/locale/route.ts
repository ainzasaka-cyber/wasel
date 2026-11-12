import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/csrf";
import { env } from "@/lib/env";
import { requestIdFrom, withRequestId } from "@/lib/request-id";
import { getCurrentUser } from "@/modules/auth/current-user";
import { isSupportedLocale, setLocaleCookie } from "@/modules/auth/session";

export async function POST(request: Request) {
  const requestId = requestIdFrom(request);
  try {
    assertSameOrigin(request, env.APP_URL);
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const body = await request.json() as { locale?: unknown };
    if (!isSupportedLocale(body.locale)) throw new AppError("VALIDATION_ERROR", "Unsupported locale", 422, { supported: ["fr", "ar"] });
    await setLocaleCookie(body.locale);
    return withRequestId(Response.json({ data: { locale: body.locale } }), requestId);
  } catch (error) {
    return withRequestId(errorResponse(error), requestId);
  }
}
