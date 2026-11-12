import { errorResponse, AppError } from "@/lib/errors";
import { trackingRateLimiter } from "@/lib/rate-limit";
import { getPublicTracking } from "@/modules/tracking/service";

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    trackingRateLimiter.check(ip, 60, 60_000);
    const { token } = await context.params;
    const tracking = await getPublicTracking(token);
    if (!tracking) throw new AppError("NOT_FOUND", "Tracking link not found", 404);
    return Response.json({ data: tracking });
  } catch (error) {
    return errorResponse(error);
  }
}
