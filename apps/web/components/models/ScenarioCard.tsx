"use client";

import React from "react";

export interface Scenario {
  id: number;
  supplierName: string;
  amount: number;
  country: string;
  transactionType: string;
  riskFactors: string[];
}

interface ScenarioCardProps {
  scenario: Scenario;
  onDecide: (outcome: "PASSED" | "REVIEWING" | "FLAGGED") => void;
  isAnimating: boolean;
}

function riskFactorColor(factor: string): string {
  const highRisk = [
    "Sanctioned jurisdiction",
    "Shell company indicators",
    "Politically exposed person linked",
    "Sanctions watchlist match",
    "Fraudulent documentation history",
  ];
  const mediumRisk = [
    "Unusually large amount",
    "High-value rush transaction",
    "Unusual payment pattern",
    "Mismatched invoice data",
    "Complex ownership structure",
  ];

  if (highRisk.includes(factor)) return "border-red-500/40 bg-red-500/15 text-red-400";
  if (mediumRisk.includes(factor)) return "border-amber-500/40 bg-amber-500/15 text-amber-400";
  return "border-emerald-500/40 bg-emerald-500/15 text-emerald-400";
}

export function ScenarioCard({
  scenario,
  onDecide,
  isAnimating,
}: ScenarioCardProps): React.JSX.Element {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-500 ${
        isAnimating ? "translate-x-8 scale-95 opacity-0" : "translate-x-0 scale-100 opacity-100"
      }`}
    >
      {/* Scenario header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Transaction Scenario</h3>
          <span className="font-mono text-xs text-slate-500">
            TXN-{String(scenario.id).padStart(4, "0")}
          </span>
        </div>
        <p className="text-sm text-slate-400">
          Review this transaction and decide how it should be handled.
        </p>
      </div>

      {/* Transaction details grid */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-4">
          <dt className="mb-1 text-xs uppercase tracking-wider text-slate-500">Supplier</dt>
          <dd className="font-medium text-white">{scenario.supplierName}</dd>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-4">
          <dt className="mb-1 text-xs uppercase tracking-wider text-slate-500">Amount</dt>
          <dd className="font-mono text-lg font-bold text-white">
            ${scenario.amount.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-4">
          <dt className="mb-1 text-xs uppercase tracking-wider text-slate-500">Country</dt>
          <dd className="text-white">{scenario.country}</dd>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-4">
          <dt className="mb-1 text-xs uppercase tracking-wider text-slate-500">Transaction Type</dt>
          <dd className="text-white">{scenario.transactionType}</dd>
        </div>
      </div>

      {/* Risk factors */}
      <div className="mb-8">
        <h4 className="mb-3 text-sm font-medium text-slate-400">Risk Indicators</h4>
        <div className="flex flex-wrap gap-2">
          {scenario.riskFactors.map((factor) => (
            <span
              key={factor}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${riskFactorColor(factor)}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {factor}
            </span>
          ))}
          {scenario.riskFactors.length === 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              No risk indicators detected
            </span>
          )}
        </div>
      </div>

      {/* Decision buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onDecide("PASSED")}
          disabled={isAnimating}
          className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-150 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50"
        >
          <span className="block text-base">Approve</span>
          <span className="mt-0.5 block text-xs text-emerald-200/70">
            Transaction is legitimate
          </span>
        </button>
        <button
          onClick={() => onDecide("REVIEWING")}
          disabled={isAnimating}
          className="flex-1 rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-600/20 transition-all duration-150 hover:bg-amber-500 active:scale-[0.98] disabled:opacity-50"
        >
          <span className="block text-base">Flag for Review</span>
          <span className="mt-0.5 block text-xs text-amber-200/70">
            Needs further investigation
          </span>
        </button>
        <button
          onClick={() => onDecide("FLAGGED")}
          disabled={isAnimating}
          className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all duration-150 hover:bg-red-500 active:scale-[0.98] disabled:opacity-50"
        >
          <span className="block text-base">Reject</span>
          <span className="mt-0.5 block text-xs text-red-200/70">Suspicious or fraudulent</span>
        </button>
      </div>
    </div>
  );
}
