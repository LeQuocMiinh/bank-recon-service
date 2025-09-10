import { Context, MiddlewareHandler } from "hono";

const requestsMap = new Map<string, { count: number; lastRequest: number }>();
const WINDOW_TIME = 60 * 1000;
const MAX_REQUESTS = 10;

export const rateLimit: MiddlewareHandler = async (c: Context, next) => {
  const ip = c.req.header("x-forwarded-for") || c.req.header("host") || "unknown";

  const now = Date.now();
  const entry = requestsMap.get(ip) || { count: 0, lastRequest: now };

  if (now - entry.lastRequest > WINDOW_TIME) {
    entry.count = 1;
    entry.lastRequest = now;
  } else {
    entry.count += 1;
  }

  requestsMap.set(ip, entry);

  if (entry.count > MAX_REQUESTS) {
    return c.json({ ok:false, error: "Too many requests" }, 429);
  }

  return next();
};
