// Best-effort in-memory rate limiter.
// On serverless platforms (Vercel free tier) each function instance owns its own
// bucket — limits are not shared across concurrent instances or after cold starts.
// This still provides meaningful protection within a single warm instance.
const buckets = new Map<string, number[]>();

function pruneTimestamps(timestamps: number[], now: number, windowMs: number): number[] {
  return timestamps.filter((ts) => now - ts < windowMs);
}

export function getClientIp(request: Request): string {
  // x-real-ip is injected by Vercel's edge network and cannot be spoofed by clients.
  // Check it first; fall back to x-forwarded-for only in non-Vercel environments.
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = pruneTimestamps(buckets.get(key) ?? [], now, windowMs);

  if (current.length >= limit) {
    buckets.set(key, current);
    return true;
  }

  current.push(now);
  buckets.set(key, current);
  return false;
}
