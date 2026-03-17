"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@merlynn/ui";

interface ModelSummary {
  _id: string;
  name: string;
  status: string;
  nodeCount: number;
  updatedAt: string;
}

function statusBadgeVariant(status: string): "high" | "medium" | "low" {
  switch (status) {
    case "deployed":
      return "low";
    case "training":
      return "medium";
    default:
      return "high";
  }
}

function ModelsPageInner(): React.JSX.Element {
  const { data, isLoading, error } = useQuery<ModelSummary[]>({
    queryKey: ["models"],
    queryFn: async () => {
      const res = await fetch("/api/models");
      if (!res.ok) throw new Error("Failed to fetch models");
      return res.json() as Promise<ModelSummary[]>;
    },
  });

  return (
    <div className="flex h-full flex-col overflow-hidden p-4 lg:p-6">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Models</h1>
        <Link
          href="/models/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          + New Model
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          Error loading models: {(error as Error).message}
        </div>
      )}

      {/* Grid of model cards */}
      {data && data.length > 0 && (
        <div className="grid flex-1 auto-rows-min grid-cols-1 gap-4 overflow-auto md:grid-cols-2 lg:grid-cols-3">
          {data.map((model) => (
            <Link
              key={model._id}
              href={`/models/${model._id}/edit`}
              className="group rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-all hover:border-slate-700 hover:bg-slate-900/80"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-sm font-semibold text-slate-200 transition-colors group-hover:text-white">
                  {model.name}
                </h3>
                <Badge variant={statusBadgeVariant(model.status)}>{model.status}</Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  {model.nodeCount} nodes
                </span>
                <span>Updated {new Date(model.updatedAt).toLocaleDateString("en-ZA")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {data && data.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center text-slate-400">
          <svg
            className="mb-4 h-12 w-12 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="text-lg font-medium">No models yet</p>
          <p className="mt-1 text-sm">Create your first decision model to get started</p>
          <Link
            href="/models/new"
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            + New Model
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ModelsPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
        </div>
      }
    >
      <ModelsPageInner />
    </Suspense>
  );
}
