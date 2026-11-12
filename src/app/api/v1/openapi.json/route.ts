import specification from "@/../../openapi/wasel-v1.json";

export function GET() {
  return Response.json(specification, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
