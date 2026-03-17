import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@merlynn/ui";
import { getDecisionById } from "@/lib/db";
import { ConfidenceGauge } from "@/components/decisions/ConfidenceGauge";
import { FeedbackPanel } from "@/components/decisions/FeedbackPanel";
import { AskTomPanel } from "@/components/decisions/AskTomPanel";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DecisionDetailPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const decision = await getDecisionById(id);

  if (!decision) {
    notFound();
  }

  const riskColor =
    decision.riskScore >= 70
      ? "text-red-400 border-red-500/30 bg-red-500/10"
      : decision.riskScore >= 40
        ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
        : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";

  const maxContribution = Math.max(...decision.shapValues.map((s) => Math.abs(s.contribution)));

  const serializedFeedback = decision.feedback
    ? {
        rating: decision.feedback.rating,
        note: decision.feedback.note,
        submittedBy: decision.feedback.submittedBy,
        submittedAt: new Date(decision.feedback.submittedAt),
      }
    : undefined;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/decisions"
          className="text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          &larr; Back to Decisions
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold text-white">{decision.transactionId}</h1>
          <p className="mt-1 text-slate-400">{decision.supplierName}</p>
        </div>
        <Badge variant={decision.riskLevel.toLowerCase() as "high" | "medium" | "low"}>
          {decision.riskLevel}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content — 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Top cards row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Risk Score */}
            <Card className={`border ${riskColor.split(" ").slice(1).join(" ")}`}>
              <CardHeader>
                <CardTitle>Risk Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-5xl font-bold ${riskColor.split(" ")[0]}`}>
                  {decision.riskScore}
                  <span className="text-lg text-slate-500">/100</span>
                </div>
              </CardContent>
            </Card>

            {/* Confidence */}
            <Card>
              <CardHeader>
                <CardTitle>Model Confidence</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ConfidenceGauge value={decision.confidence ?? 75} />
              </CardContent>
            </Card>

            {/* Model Info */}
            <Card>
              <CardHeader>
                <CardTitle>Model</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-slate-200">
                  {decision.modelName ?? "Fraud Analyst — Carl"}
                </p>
                <p className="mt-1 text-xs text-slate-500">Outcome: {decision.outcome}</p>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                <div>
                  <dt className="text-slate-500">Amount</dt>
                  <dd className="font-mono text-lg text-white">
                    ${decision.amount.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Country</dt>
                  <dd className="text-white">{decision.country}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Type</dt>
                  <dd className="text-white">{decision.transactionType}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Outcome</dt>
                  <dd
                    className={`font-semibold ${
                      decision.outcome === "FLAGGED"
                        ? "text-red-400"
                        : decision.outcome === "REVIEWING"
                          ? "text-amber-400"
                          : "text-emerald-400"
                    }`}
                  >
                    {decision.outcome}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Timestamp</dt>
                  <dd className="text-white">
                    {new Date(decision.timestamp).toLocaleString("en-ZA")}
                  </dd>
                </div>
                {decision.reviewedBy && (
                  <div>
                    <dt className="text-slate-500">Reviewed By</dt>
                    <dd className="text-white">{decision.reviewedBy}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Explanation */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-slate-200">{decision.explanation}</p>
            </CardContent>
          </Card>

          {/* SHAP Values */}
          <Card>
            <CardHeader>
              <CardTitle>SHAP Values — Factor Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" data-testid="shap-values">
                {decision.shapValues.map((shap) => {
                  const isPositive = shap.contribution > 0;
                  const widthPercent = (Math.abs(shap.contribution) / maxContribution) * 100;

                  return (
                    <div key={shap.factor} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-mono text-slate-300">
                          {shap.factor.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`font-mono ${isPositive ? "text-red-400" : "text-emerald-400"}`}
                        >
                          {isPositive ? "+" : ""}
                          {shap.contribution.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isPositive ? "bg-red-500/60" : "bg-emerald-500/60"
                          }`}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          <FeedbackPanel decisionId={id} existingFeedback={serializedFeedback} />
        </div>

        {/* Right sidebar — Ask TOM */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <AskTomPanel
              decisionContext={{
                transactionId: decision.transactionId,
                riskLevel: decision.riskLevel,
                riskScore: decision.riskScore,
                supplierName: decision.supplierName,
                explanation: decision.explanation,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
