"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Badge } from "@merlynn/ui";
import { ScenarioCard, type Scenario } from "@/components/models/ScenarioCard";
import { TrainingProgress } from "@/components/models/TrainingProgress";

/* -------------------------------------------------------------------------- */
/*  Scenario generation                                                       */
/* -------------------------------------------------------------------------- */

const SUPPLIER_NAMES = [
  "Meridian Supply Co.",
  "Apex Global Trading",
  "Pacific Rim Logistics",
  "Northstar Industrial",
  "QuantumTech Solutions",
  "Greenfield Exports Ltd.",
  "Orion Commodities GmbH",
  "Blackwater Trading LLC",
  "Zenith Procurement SA",
  "Atlas Freight & Cargo",
  "Nova Financial Services",
  "Redline Capital Holdings",
  "Silverstone Partners Intl.",
  "Oceanic Ventures BVI",
  "Pinnacle Wholesale Corp.",
];

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Germany",
  "Singapore",
  "Switzerland",
  "Nigeria",
  "Russia",
  "Iran",
  "Cayman Islands",
  "Panama",
];

const HIGH_RISK_COUNTRIES = new Set(["Nigeria", "Russia", "Iran", "Cayman Islands", "Panama"]);

const TRANSACTION_TYPES = [
  "Wire Transfer",
  "Invoice Payment",
  "Letter of Credit",
  "Trade Finance",
  "Prepayment",
  "Escrow Release",
];

const RISK_FACTORS = [
  "Sanctioned jurisdiction",
  "Shell company indicators",
  "Politically exposed person linked",
  "Sanctions watchlist match",
  "Fraudulent documentation history",
  "Unusually large amount",
  "High-value rush transaction",
  "Unusual payment pattern",
  "Mismatched invoice data",
  "Complex ownership structure",
  "First-time supplier",
  "Inconsistent country of origin",
  "High-risk jurisdiction",
  "Layered intermediary transactions",
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateScenarios(count: number): Scenario[] {
  const rand = seededRandom(42);
  const scenarios: Scenario[] = [];

  for (let i = 0; i < count; i++) {
    const country = COUNTRIES[Math.floor(rand() * COUNTRIES.length)] ?? "United States";
    const isHighRiskCountry = HIGH_RISK_COUNTRIES.has(country);

    // Amount tier
    const tier = rand();
    let amount: number;
    if (tier < 0.4) {
      amount = Math.round((5000 + rand() * 45000) / 100) * 100;
    } else if (tier < 0.8) {
      amount = Math.round((50000 + rand() * 450000) / 1000) * 1000;
    } else {
      amount = Math.round((500000 + rand() * 4500000) / 10000) * 10000;
    }

    const isLargeAmount = amount > 500000;

    // Number of risk factors: influenced by country and amount
    let baseFactors = Math.floor(rand() * 2);
    if (isHighRiskCountry) baseFactors += 1;
    if (isLargeAmount) baseFactors += 1;
    if (rand() > 0.7) baseFactors += 1;
    const numFactors = Math.min(baseFactors, 4);

    // Pick random risk factors
    const shuffled = [...RISK_FACTORS].sort(() => rand() - 0.5);
    const riskFactors = shuffled.slice(0, numFactors);

    scenarios.push({
      id: 1000 + i,
      supplierName:
        SUPPLIER_NAMES[Math.floor(rand() * SUPPLIER_NAMES.length)] ?? "Unknown Supplier",
      amount,
      country,
      transactionType:
        TRANSACTION_TYPES[Math.floor(rand() * TRANSACTION_TYPES.length)] ?? "Wire Transfer",
      riskFactors,
    });
  }

  return scenarios;
}

/* -------------------------------------------------------------------------- */
/*  Model data type                                                           */
/* -------------------------------------------------------------------------- */

interface ModelData {
  _id: string;
  name: string;
  status: string;
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

/* -------------------------------------------------------------------------- */
/*  Page component                                                            */
/* -------------------------------------------------------------------------- */

const TOTAL_SCENARIOS = 20;

export default function TrainModelPage(): React.JSX.Element {
  const params = useParams();
  const id = params.id as string;

  const {
    data: model,
    isLoading,
    error,
  } = useQuery<ModelData>({
    queryKey: ["model", id],
    queryFn: async () => {
      const res = await fetch(`/api/models/${id}`);
      if (!res.ok) throw new Error("Failed to fetch model");
      return res.json() as Promise<ModelData>;
    },
  });

  const scenarios = useMemo(() => generateScenarios(TOTAL_SCENARIOS), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<Array<"PASSED" | "REVIEWING" | "FLAGGED">>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleDecide = useCallback((outcome: "PASSED" | "REVIEWING" | "FLAGGED") => {
    setIsAnimating(true);
    setDecisions((prev) => [...prev, outcome]);

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsAnimating(false);
    }, 500);
  }, []);

  const handleComplete = useCallback(async () => {
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/models/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "training" }),
      });
      if (!res.ok) throw new Error("Failed to update model");
      setIsCompleted(true);
    } catch {
      // Could show error toast
    } finally {
      setIsCompleting(false);
    }
  }, [id]);

  /* Loading state */
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
      </div>
    );
  }

  /* Error state */
  if (error || !model) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-400">
          {error ? `Error: ${(error as Error).message}` : "Model not found"}
        </div>
      </div>
    );
  }

  const allDone = currentIndex >= TOTAL_SCENARIOS;
  const currentScenario = scenarios[currentIndex];

  return (
    <div className="flex h-screen flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href={`/models/${id}`}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            &larr; Back to Model
          </Link>
          <div className="h-5 w-px bg-slate-700" />
          <h1 className="text-lg font-semibold text-white">{model.name}</h1>
          <Badge variant={statusBadgeVariant(model.status)}>{model.status}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Training Session</span>
          <span className="rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-0.5 font-mono text-xs font-semibold text-blue-400">
            {decisions.length}/{TOTAL_SCENARIOS}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Scenario Card (2/3) */}
            <div className="lg:col-span-2">
              {allDone ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/15">
                    <svg
                      className="h-10 w-10 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-white">All Scenarios Complete</h2>
                  <p className="mx-auto max-w-md text-slate-400">
                    You have reviewed all {TOTAL_SCENARIOS} scenarios. Use the &quot;Complete
                    Training&quot; button to submit your decisions and begin model training.
                  </p>
                </div>
              ) : currentScenario ? (
                <ScenarioCard
                  scenario={currentScenario}
                  onDecide={handleDecide}
                  isAnimating={isAnimating}
                />
              ) : null}
            </div>

            {/* Right: Training Progress (1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <TrainingProgress
                  totalScenarios={TOTAL_SCENARIOS}
                  completedScenarios={decisions.length}
                  decisions={decisions}
                  onComplete={() => void handleComplete()}
                  isCompleting={isCompleting}
                  isCompleted={isCompleted}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
