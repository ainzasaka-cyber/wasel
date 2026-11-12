import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { errorResponse } from "@/lib/errors";
import { revokeSession, SESSION_COOKIE } from "@/modules/auth/session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) await revokeSession(prisma, token);
    cookieStore.delete(SESSION_COOKIE);
    return Response.json({ data: { signedOut: true } });
  } catch (error) {
    return errorResponse(error);
  }
}
