const stores = new Map<string, Map<string, number[]>>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const DEFAULTS: Record<string, RateLimitConfig> = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  otp: { windowMs: 60 * 1000, maxRequests: 3 },
  booking: { windowMs: 60 * 1000, maxRequests: 10 },
  passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  api: { windowMs: 60 * 1000, maxRequests: 60 },
};

export function checkRateLimit(identifier: string, endpoint: string): { allowed: boolean; remaining: number; resetIn: number } {
  const config = DEFAULTS[endpoint] || DEFAULTS.api;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let store = stores.get(endpoint) || new Map();
  let timestamps = store.get(identifier) || [];

  timestamps = timestamps.filter((t: number) => t > windowStart);
  timestamps.push(now);
  store.set(identifier, timestamps);
  stores.set(endpoint, store);

  const allowed = timestamps.length <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - timestamps.length);
  const resetIn = timestamps.length > 0 ? config.windowMs - (now - timestamps[0]) : 0;

  return { allowed, remaining, resetIn };
}

export function getRateLimitHeaders(identifier: string, endpoint: string): Record<string, string> {
  const { allowed, remaining, resetIn } = checkRateLimit(identifier, endpoint);
  return {
    'X-RateLimit-Limit': String(DEFAULTS[endpoint]?.maxRequests || DEFAULTS.api.maxRequests),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(resetIn / 1000)),
    'Retry-After': allowed ? '0' : String(Math.ceil(resetIn / 1000)),
  };
}
