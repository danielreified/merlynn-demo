import React from "react";
import type { RiskBreakdown } from "@/lib/db";

interface RiskChartProps {
  breakdown: RiskBreakdown;
}

export function RiskChart({ breakdown }: RiskChartProps): React.JSX.Element {
  const { high, medium, low, total } = breakdown;

  const bars = [
    {
      label: "HIGH",
      count: high,
      pct: total > 0 ? Math.round((high / total) * 100) : 0,
      barColor: "bg-red-500",
      textColor: "text-red-400",
    },
    {
      label: "MEDIUM",
      count: medium,
      pct: total > 0 ? Math.round((medium / total) * 100) : 0,
      barColor: "bg-amber-500",
      textColor: "text-amber-400",
    },
    {
      label: "LOW",
      count: low,
      pct: total > 0 ? Math.round((low / total) * 100) : 0,
      barColor: "bg-emerald-500",
      textColor: "text-emerald-400",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="mb-5 text-lg font-semibold text-white">Risk Breakdown</h2>
      <div className="space-y-4">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className={`text-sm font-medium ${bar.textColor}`}>{bar.label}</span>
              <span className="text-sm text-slate-400">
                {bar.count} <span className="text-slate-600">({bar.pct}%)</span>
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-800">
              <div
                className={`h-2.5 rounded-full ${bar.barColor}`}
                style={{ width: `${bar.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
