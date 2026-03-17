"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@merlynn/ui";
import { Card, CardHeader, CardTitle, CardContent } from "@merlynn/ui";
import { Badge } from "@merlynn/ui";
import { createApiKey, revokeApiKey, listApiKeys } from "@/app/actions/apiKeys";

interface ApiKeyRow {
  id: string;
  name: string;
  prefix: string;
  revoked: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function SettingsPage(): React.JSX.Element {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    const data = await listApiKeys();
    setKeys(data);
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    setNewKey(null);

    const result = await createApiKey(name.trim());

    if (result.success && result.key) {
      setNewKey(result.key);
      setName("");
      await fetchKeys();
    } else {
      setError(result.error ?? "Failed to create key");
    }

    setLoading(false);
  }

  async function handleRevoke(keyId: string) {
    setRevoking(keyId);
    const result = await revokeApiKey(keyId);
    if (result.success) {
      await fetchKeys();
    } else {
      setError(result.error ?? "Failed to revoke key");
    }
    setRevoking(null);
  }

  async function handleCopy() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your API keys for programmatic access
          </p>
        </div>

        {/* Create new key */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-200">Create API Key</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex items-end gap-3">
              <div className="flex-1">
                <label
                  htmlFor="key-name"
                  className="mb-1.5 block text-sm font-medium text-slate-400"
                >
                  Key name
                </label>
                <input
                  id="key-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production API"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button type="submit" disabled={loading || !name.trim()}>
                {loading ? "Generating..." : "Generate Key"}
              </Button>
            </form>

            {error && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {newKey && (
              <div className="mt-4 space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 shrink-0 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-amber-400">
                    Copy this key now. It will not be shown again.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 select-all break-all rounded-md bg-slate-900 px-3 py-2 font-mono text-sm text-slate-200">
                    {newKey}
                  </code>
                  <Button variant="outline" size="sm" onClick={handleCopy} type="button">
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Existing keys */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-200">API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            {keys.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No API keys yet. Create one above.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="py-3 pr-4 text-left font-medium text-slate-400">Name</th>
                      <th className="py-3 pr-4 text-left font-medium text-slate-400">Key</th>
                      <th className="py-3 pr-4 text-left font-medium text-slate-400">Status</th>
                      <th className="py-3 pr-4 text-left font-medium text-slate-400">Last Used</th>
                      <th className="py-3 pr-4 text-left font-medium text-slate-400">Created</th>
                      <th className="py-3 text-right font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((k) => (
                      <tr key={k.id} className="border-b border-slate-800/50 last:border-0">
                        <td className="py-3 pr-4 text-slate-200">{k.name}</td>
                        <td className="py-3 pr-4">
                          <code className="font-mono text-xs text-slate-400">{k.prefix}...</code>
                        </td>
                        <td className="py-3 pr-4">
                          {k.revoked ? (
                            <Badge variant="high">Revoked</Badge>
                          ) : (
                            <Badge variant="low">Active</Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-slate-400">
                          {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}
                        </td>
                        <td className="py-3 pr-4 text-slate-400">
                          {new Date(k.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          {!k.revoked && (
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={revoking === k.id}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Revoke API key "${k.name}"? This cannot be undone.`
                                  )
                                ) {
                                  handleRevoke(k.id);
                                }
                              }}
                            >
                              {revoking === k.id ? "Revoking..." : "Revoke"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
