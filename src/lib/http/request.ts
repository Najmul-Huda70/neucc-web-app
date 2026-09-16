const MAX_JSON_BODY_BYTES = 64 * 1024;

export async function readJsonBody(req: Request): Promise<unknown | null> {
  const contentType = req.headers.get("content-type")?.split(";", 1)[0].trim();
  const contentLength = Number(req.headers.get("content-length") ?? 0);

  if (contentType !== "application/json" || contentLength > MAX_JSON_BODY_BYTES) {
    return null;
  }

  const body = await req.text();
  if (new TextEncoder().encode(body).byteLength > MAX_JSON_BODY_BYTES) return null;

  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

export function withRateLimitHeaders(response: Response, remaining: number, resetAt: number) {
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, remaining)));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
  return response;
}