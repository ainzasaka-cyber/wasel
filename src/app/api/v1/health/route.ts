export async function GET() {
  return Response.json({ status: "ok", service: "wasel", database: "not_checked" });
}
