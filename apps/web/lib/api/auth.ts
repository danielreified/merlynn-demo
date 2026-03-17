import { createMiddleware } from "hono/factory";
import { connectDB, ApiKey } from "@merlynn/db";
import { createHash } from "crypto";

// In-memory cache: hash -> { valid: boolean, expiresAt: number }
const keyCache = new Map<string, { valid: boolean; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * API key auth middleware for external API consumers.
 * Requires a valid API key in the Authorization header (Bearer <api-key>).
 */
export const flexAuth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized. Provide a valid API key." }, 401);
  }

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
  } catch (error) {
    console.error("API key auth error:", error);
    return c.json({ error: "Authentication failed" }, 500);
  }
});
