import { prisma } from "@/lib/db";
import { requestIdFrom, withRequestId } from "@/lib/request-id";

export async function GET(request: Request) {
  const requestId = requestIdFrom(request);
  try {
    await prisma.$queryRaw`SELECT 1`;
    return withRequestId(Response.json({ status: "ok", service: "wasel", database: "ok" }), requestId);
  } catch {
    return withRequestId(Response.json({ status: "degraded", service: "wasel", database: "unavailable" }, { status: 503 }), requestId);
  }
}
