"use client";

import React, { useCallback, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Badge } from "@merlynn/ui";
import { FilterBar, type FilterValues } from "@/components/decisions/FilterBar";
import { Pagination } from "@/components/decisions/Pagination";
import type { IDecision, RiskLevel, FeedbackRating } from "@merlynn/db";

interface DecisionsResponse {
  decisions: (IDecision & { _id: string })[];
  total: number;
  page: number;
  totalPages: number;
}

const LIMIT = 20;

function feedbackIcon(rating?: FeedbackRating): React.JSX.Element {
  if (!rating) {
    return (
      <span className="text-slate-500" title="No feedback">
        &mdash;
      </span>
    );
  }
  switch (rating) {
    case "CORRECT":
      return (
        <span className="text-emerald-400" title="Correct">
          &check;
        </span>
      );
    case "PARTIAL":
      return (
        <span className="text-amber-400" title="Partial">
          ~
        </span>
      );
    case "INCORRECT":
      return (
        <span className="text-red-400" title="Incorrect">
          &times;
        </span>
      );
  }
}

function riskBadgeVariant(level: RiskLevel): "high" | "medium" | "low" {
  return level.toLowerCase() as "high" | "medium" | "low";
}

function DecisionsPageInner(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filters: FilterValues = {
    search: searchParams.get("search") ?? "",
    riskLevel: searchParams.get("riskLevel") ?? "ALL",
    modelName: searchParams.get("modelName") ?? "ALL",
    dateFrom: searchParams.get("dateFrom") ?? "",
    dateTo: searchParams.get("dateTo") ?? "",
  };

  const page = parseInt(searchParams.get("page") ?? "1", 10);

  const setParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "ALL") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`/decisions?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handleFilterChange = useCallback(
    (updated: FilterValues) => {
      setParams({ ...updated, page: "1" });
    },
    [setParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setParams({ page: String(newPage) });
    },
    [setParams]
  );

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(LIMIT));
    if (filters.riskLevel && filters.riskLevel !== "ALL")
      params.set("riskLevel", filters.riskLevel);
    if (filters.search) params.set("search", filters.search);
    if (filters.modelName && filters.modelName !== "ALL")
      params.set("modelName", filters.modelName);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    return params.toString();
  }, [page, filters]);

  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(
    async (format: "csv" | "json") => {
      setExporting(true);
      try {
        const params = new URLSearchParams();
        params.set("format", format);
        if (filters.riskLevel && filters.riskLevel !== "ALL")
          params.set("riskLevel", filters.riskLevel);
        if (filters.search) params.set("search", filters.search);
        if (filters.modelName && filters.modelName !== "ALL")
          params.set("modelName", filters.modelName);
        if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.set("dateTo", filters.dateTo);

        const res = await fetch(`/api/decisions/export?${params.toString()}`);
        if (!res.ok) throw new Error("Export failed");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `decisions.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      } finally {
        setExporting(false);
      }
    },
    [filters]
  );

  const { data, isLoading, error } = useQuery<DecisionsResponse>({
    queryKey: ["decisions", filters, page],
    queryFn: async () => {
      const res = await fetch(`/api/decisions?${buildQueryString()}`);
      if (!res.ok) throw new Error("Failed to fetch decisions");
      return res.json() as Promise<DecisionsResponse>;
    },
  });

  return (
    <div className="flex h-full flex-col overflow-hidden p-4 lg:p-6">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Decisions Log</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("csv")}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            CSV
          </button>
          <button
            onClick={() => handleExport("json")}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            JSON
          </button>
        </div>
      </div>

      <div className="mb-4 shrink-0">
        <FilterBar filters={filters} onChange={handleFilterChange} />
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
          Error loading decisions: {(error as Error).message}
        </div>
      )}

      {/* Table */}
      {data && data.decisions.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-slate-700">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-slate-700 bg-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Transaction ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Model
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Country
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Risk
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                    Confidence
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Outcome
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                    Feedback
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.decisions.map((d) => (
                  <tr
                    key={d._id}
                    onClick={() => router.push(`/decisions/${d._id}`)}
                    className="cursor-pointer transition-colors hover:bg-slate-800/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/decisions/${d._id}`}
                        className="font-mono text-blue-400 hover:text-blue-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {d.transactionId}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-300">{d.modelName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-200">{d.supplierName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-slate-200">
                      ${d.amount.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-300">{d.country}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge variant={riskBadgeVariant(d.riskLevel)}>{d.riskLevel}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-slate-300">
                      {d.confidence}%
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={
                          d.outcome === "FLAGGED"
                            ? "text-red-400"
                            : d.outcome === "REVIEWING"
                              ? "text-amber-400"
                              : "text-emerald-400"
                        }
                      >
                        {d.outcome}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-lg">
                      {feedbackIcon(d.feedback?.rating)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400">
                      {new Date(d.timestamp).toLocaleString("en-ZA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 shrink-0">
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              limit={LIMIT}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {data && data.decisions.length === 0 && (
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
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-medium">No decisions found</p>
          <p className="mt-1 text-sm">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}

export default function DecisionsPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
        </div>
      }
    >
      <DecisionsPageInner />
    </Suspense>
  );
}
