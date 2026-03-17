"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { RiskBadge } from "./RiskBadge";
import type { RiskLevel, Outcome } from "@merlynn/db";

interface DecisionResponse {
  _id: string;
  transactionId: string;
  supplierName: string;
  amount: number;
  country: string;
  riskLevel: RiskLevel;
  outcome: Outcome;
  timestamp: string;
}

async function fetchDecisions(): Promise<DecisionResponse[]> {
  const res = await fetch("/api/decisions");
  if (!res.ok) throw new Error("Failed to fetch decisions");
  return res.json() as Promise<DecisionResponse[]>;
}

export function DecisionList(): React.JSX.Element {
  const { data, isLoading, error } = useQuery({
    queryKey: ["decisions"],
    queryFn: fetchDecisions,
    // Disabled by default since dashboard page fetches server-side
    // This component demonstrates React Query pattern for client-side refetching
    enabled: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
        Error loading decisions: {error.message}
      </div>
    );
  }

  if (!data) return <></>;

  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div
          key={d._id}
          className="flex items-center justify-between rounded-lg bg-slate-800/30 p-3"
        >
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-blue-400">{d.transactionId}</span>
            <span className="text-sm text-slate-200">{d.supplierName}</span>
          </div>
          <RiskBadge level={d.riskLevel} />
        </div>
      ))}
    </div>
  );
}
