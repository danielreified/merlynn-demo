"use server";

import { randomBytes, createHash } from "crypto";
import { connectDB, ApiKey } from "@merlynn/db";
import { auth } from "@/lib/auth";

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

interface CreateKeyResult {
  success: boolean;
  key?: string;
  id?: string;
  error?: string;
}

export async function createApiKey(name: string): Promise<CreateKeyResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  if (!name || name.trim().length === 0) {
    return { success: false, error: "Name is required" };
  }

  await connectDB();

  // Generate a key: mk_live_ + 32 random hex chars
  const rawKey = `mk_live_${randomBytes(24).toString("hex")}`;
  const keyHash = hashKey(rawKey);
  const prefix = rawKey.slice(0, 16);

  const apiKey = await ApiKey.create({
    name: name.trim(),
    keyHash,
    prefix,
    createdBy: session.user.id,
    revoked: false,
  });

  return { success: true, key: rawKey, id: apiKey._id.toString() };
}

export async function revokeApiKey(keyId: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  await connectDB();

  const result = await ApiKey.findOneAndUpdate(
    { _id: keyId, createdBy: session.user.id },
    { revoked: true },
    { new: true }
  );

  if (!result) return { success: false, error: "API key not found" };
  return { success: true };
}

export async function listApiKeys() {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();

  const keys = await ApiKey.find({ createdBy: session.user.id })
    .sort({ createdAt: -1 })
    .select("name prefix revoked lastUsedAt expiresAt createdAt")
    .lean();

  return keys.map((k: Record<string, unknown>) => ({
    id: String(k._id),
    name: k.name as string,
    prefix: k.prefix as string,
    revoked: k.revoked as boolean,
    lastUsedAt: k.lastUsedAt ? (k.lastUsedAt as Date).toISOString() : null,
    createdAt: (k.createdAt as Date).toISOString(),
  }));
}
