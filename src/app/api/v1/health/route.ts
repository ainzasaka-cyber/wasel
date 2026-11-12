import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", service: "wasel", database: "ok" });
  } catch {
    return Response.json({ status: "degraded", service: "wasel", database: "unavailable" }, { status: 503 });
  }
}
