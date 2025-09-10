import { Context, MiddlewareHandler } from "hono";
import { verifyToken } from "../utils/jwt";

export const authMiddleware: MiddlewareHandler = async(c: Context, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ok: false, error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];
  const { valid, decoded } = verifyToken(token);

  if (!valid) {
    return c.json({ ok: false, error: "Invalid token" }, 401);
  }

  c.set("user", decoded);
  await next();
}
