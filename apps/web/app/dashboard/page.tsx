import React from "react";
import Link from "next/link";
import { Badge } from "@merlynn/ui";
import { getDecisions, getDashboardStats, getRiskBreakdown } from "@/lib/db";
import { StatsCards } from "@/components/StatsCards";
import { RiskChart } from "@/components/dashboard/RiskChart";
import { ActiveModels } from "@/components/dashboard/ActiveModels";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const [stats, decisions, riskBreakdown, session] = await Promise.all([
    getDashboardStats(),
    getDecisions(undefined, 7),
    getRiskBreakdown(),
    auth(),
  ]);

  const serializedDecisions = decisions.map((d) => ({
    ...d,
    _id: String((d as unknown as Record<string, unknown>)._id ?? ""),
    timestamp: new Date(d.timestamp).toISOString(),
  }));

  return (
    <div className="flex h-full flex-col overflow-hidden p-4 lg:p-6">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold text-white">Risk Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          {session?.user?.name
            ? `Welcome back, ${session.user.name}`
            : "Financial transaction risk monitoring"}
        </p>
      </div>

      <div className="mb-4 shrink-0">
        <StatsCards
          totalToday={stats.totalToday}
          highRisk={stats.highRisk}
          accuracyRate={stats.accuracyRate}
          avgConfidence={stats.avgConfidence}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main content - left column */}
        <div className="flex min-h-0 flex-col gap-4 lg:col-span-2">
          <div className="shrink-0">
            <RiskChart breakdown={riskBreakdown} />
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-800 p-3">
              <h2 className="text-sm font-semibold text-white">Recent Decisions</h2>
              <Link
                href="/decisions"
                className="text-xs text-blue-400 transition-colors hover:text-blue-300"
              >
                View all &rarr;
              </Link>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Transaction ID
                    </th>
                    <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Supplier
                    </th>
                    <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Country
                    </th>
                    <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Risk
                    </th>
                    <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Outcome
                    </th>
                    <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {serializedDecisions.map((decision) => (
                    <tr
                      key={decision.transactionId}
                      className="transition-colors hover:bg-slate-800/30"
                    >
                      <td className="px-3 py-2">
                        <Link
                          href={`/decisions/${decision._id}`}
                          className="font-mono text-xs text-blue-400 hover:text-blue-300"
                        >
                          {decision.transactionId}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-slate-200">{decision.supplierName}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-200">
                        ${decision.amount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-slate-300">{decision.country}</td>
                      <td className="px-3 py-2">
                        <Badge
                          variant={decision.riskLevel.toLowerCase() as "high" | "medium" | "low"}
                        >
                          {decision.riskLevel}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-xs font-medium ${
                            decision.outcome === "FLAGGED"
                              ? "text-red-400"
                              : decision.outcome === "REVIEWING"
                                ? "text-amber-400"
                                : "text-emerald-400"
                          }`}
                        >
                          {decision.outcome}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-400">
                        {new Date(decision.timestamp).toLocaleDateString("en-ZA", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column - models sidebar */}
        <div className="lg:col-span-1">
          <ActiveModels />
        </div>
      </div>
    </div>
  );
}
