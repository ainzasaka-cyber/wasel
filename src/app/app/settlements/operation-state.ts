export type OperationLoadState = "loading" | "ready" | "unavailable" | "error";

export function operationState(status: number, hasBody: boolean): OperationLoadState {
  if (status === 503) return "unavailable";
  if (status >= 200 && status < 300 && hasBody) return "ready";
  return "error";
}
