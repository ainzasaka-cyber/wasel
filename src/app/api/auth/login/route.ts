import { loginSchema } from "@/lib/validation";
import { assertSameOrigin } from "@/lib/csrf";
import { env } from "@/lib/env";
import { errorResponse, AppError } from "@/lib/errors";
import { authenticateUser } from "@/modules/auth/service";
import { setSessionCookie } from "@/modules/auth/session";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request, env.APP_URL);
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) throw new AppError("VALIDATION_ERROR", "Invalid login input", 422, { issues: parsed.error.issues });
    const result = await authenticateUser(prisma, parsed.data.email, parsed.data.password);
    await setSessionCookie(result.token);
    return Response.json({ data: { userId: result.userId } });
  } catch (error) {
    return errorResponse(error);
  }
}
