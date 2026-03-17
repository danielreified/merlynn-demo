import { createMiddleware } from "hono/factory";
import { connectDB, ApiKey } from "@merlynn/db";
import { createHash } from "crypto";
import { getToken } from "next-auth/jwt";

// In-memory cache: hash -> { valid: boolean, expiresAt: number }
const keyCache = new Map<string, { valid: boolean; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Flexible auth middleware that accepts EITHER:
 * - A valid API key in the Authorization header (Bearer <api-key>)
 * - A valid Next.js session cookie (for internal browser requests)
 */
export const flexAuth = createMiddleware(async (c, next) => {
  // First, check for API key in Authorization header
  const authHeader = c.req.header("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const apiKey = authHeader.slice(7);
    const hash = hashKey(apiKey);

    // Check cache first
    const cached = keyCache.get(hash);
    if (cached && cached.expiresAt > Date.now()) {
      if (!cached.valid) {
        return c.json({ error: "Invalid API key" }, 401);
      }
      await next();
      return;
    }

    // Cache miss — check DB
    try {
      await connectDB();
      const keyDoc = await ApiKey.findOne({ keyHash: hash, revoked: false });

      if (!keyDoc) {
        keyCache.set(hash, { valid: false, expiresAt: Date.now() + CACHE_TTL });
        return c.json({ error: "Invalid API key" }, 401);
      }

      // Check expiry
      if (keyDoc.expiresAt && keyDoc.expiresAt < new Date()) {
        keyCache.set(hash, { valid: false, expiresAt: Date.now() + CACHE_TTL });
        return c.json({ error: "API key has expired" }, 401);
      }

      // Valid key — cache it and update lastUsedAt (fire and forget)
      keyCache.set(hash, { valid: true, expiresAt: Date.now() + CACHE_TTL });
      ApiKey.updateOne({ _id: keyDoc._id }, { lastUsedAt: new Date() }).exec();

      await next();
      return;
    } catch (error) {
      console.error("API key auth error:", error);
      return c.json({ error: "Authentication failed" }, 500);
    }
  }

  // If no API key, check for session cookie (internal Next.js requests)
  try {
    const token = await getToken({
      req: c.req.raw as Parameters<typeof getToken>[0]["req"],
      secret: process.env.AUTH_SECRET,
      cookieName: "__Secure-authjs.session-token",
    });
    if (token) {
      await next();
      return;
    }
  } catch {
    // Session check failed, fall through to 401
  }

  return c.json({ error: "Unauthorized. Provide a valid API key or session." }, 401);
});
