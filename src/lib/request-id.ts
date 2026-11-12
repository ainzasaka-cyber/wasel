import { randomUUID } from "node:crypto";

export const REQUEST_ID_HEADER = "x-request-id";

export function requestIdFrom(request: Request): string {
  const supplied = request.headers.get(REQUEST_ID_HEADER)?.trim();
  return supplied && /^[A-Za-z0-9._:-]{1,128}$/.test(supplied) ? supplied : randomUUID();
}

export function withRequestId(response: Response, requestId: string): Response {
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}
