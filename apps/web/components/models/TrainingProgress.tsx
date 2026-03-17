"use client";

import React from "react";

interface TrainingProgressProps {
  totalScenarios: number;
  completedScenarios: number;
  decisions: Array<"PASSED" | "REVIEWING" | "FLAGGED">;
  onComplete: () => void;
  isCompleting: boolean;
  isCompleted: boolean;
}

function ProgressRing({
  completed,
  total,
  size = 160,
}: {
  completed: number;
  total: number;
  size?: number;
}): React.JSX.Element {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? completed / total : 0;
  const offset = circumference - progress * circumference;

  const color =
    progress >= 1 ? "stroke-emerald-400" : progress >= 0.5 ? "stroke-blue-400" : "stroke-amber-400";

  const trackColor =
    progress >= 1
      ? "stroke-emerald-500/15"
      : progress >= 0.5
        ? "stroke-blue-500/15"
        : "stroke-amber-500/15";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackColor}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${color} transition-all duration-700 ease-out`}
        />
        <text
          x={size / 2}
          y={size / 2 - 8}
          textAnchor="middle"
          dominantBaseline="central"
          className="origin-center rotate-90 fill-white"
          style={{ fontSize: size * 0.22, fontWeight: 700 }}
        >
          {completed}/{total}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 16}
          textAnchor="middle"
          dominantBaseline="central"
          className="origin-center rotate-90 fill-slate-500"
          style={{ fontSize: size * 0.09 }}
        >
          scenarios
        </text>
      </svg>
    </div>
  );
}

export function TrainingProgress({
  totalScenarios,
  completedScenarios,
  decisions,
  onComplete,
  isCompleting,
  isCompleted,
}: TrainingProgressProps): React.JSX.Element {
  const approveCount = decisions.filter((d) => d === "PASSED").length;
  const flagCount = decisions.filter((d) => d === "REVIEWING").length;
  const rejectCount = decisions.filter((d) => d === "FLAGGED").length;
  const total = decisions.length || 1;

  const approveRate = Math.round((approveCount / total) * 100);
  const flagRate = Math.round((flagCount / total) * 100);
  const rejectRate = Math.round((rejectCount / total) * 100);

  const minScenarios = 10;
  const canComplete = completedScenarios >= minScenarios;

  // Consistency: measure how spread out the decisions are (higher = more consistent pattern)
  const maxRate = Math.max(approveRate, flagRate, rejectRate);
  const consistency = decisions.length >= 3 ? Math.min(maxRate + 10, 100) : 0;

  if (isCompleted) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
            <svg
              className="h-8 w-8 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-emerald-400">Training Submitted</h3>
          <p className="text-sm text-slate-400">
            Your {completedScenarios} decisions have been captured. The model is now learning from
            your expert judgment patterns.
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-full animate-pulse rounded-full bg-emerald-500" />
          </div>
          <p className="text-xs text-slate-500">Model status updated to &quot;training&quot;</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress ring */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h3 className="mb-4 text-center text-sm font-medium text-slate-400">Training Progress</h3>
        <div className="mb-4 flex justify-center">
          <ProgressRing completed={completedScenarios} total={totalScenarios} />
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out"
            style={{
              width: `${(completedScenarios / totalScenarios) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Decision stats */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <h3 className="mb-4 text-sm font-medium text-slate-400">Decision Breakdown</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-300">Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-emerald-400">
                {approveCount}
              </span>
              <span className="w-10 text-right text-xs text-slate-500">
                {decisions.length > 0 ? `${approveRate}%` : "--"}
              </span>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500/60 transition-all duration-500"
              style={{ width: decisions.length > 0 ? `${approveRate}%` : "0%" }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-sm text-slate-300">Flagged</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-amber-400">{flagCount}</span>
              <span className="w-10 text-right text-xs text-slate-500">
                {decisions.length > 0 ? `${flagRate}%` : "--"}
              </span>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-amber-500/60 transition-all duration-500"
              style={{ width: decisions.length > 0 ? `${flagRate}%` : "0%" }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="text-sm text-slate-300">Rejected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-red-400">{rejectCount}</span>
              <span className="w-10 text-right text-xs text-slate-500">
                {decisions.length > 0 ? `${rejectRate}%` : "--"}
              </span>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-red-500/60 transition-all duration-500"
              style={{ width: decisions.length > 0 ? `${rejectRate}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {/* Consistency */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <h3 className="mb-3 text-sm font-medium text-slate-400">Decision Consistency</h3>
        {decisions.length < 3 ? (
          <p className="text-xs text-slate-500">
            Make at least 3 decisions to see consistency score
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  consistency >= 70
                    ? "bg-emerald-500"
                    : consistency >= 40
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${consistency}%` }}
              />
            </div>
            <span
              className={`font-mono text-sm font-semibold ${
                consistency >= 70
                  ? "text-emerald-400"
                  : consistency >= 40
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            >
              {consistency}%
            </span>
          </div>
        )}
      </div>

      {/* Complete button */}
      <button
        onClick={onComplete}
        disabled={!canComplete || isCompleting}
        className={`w-full rounded-lg px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
          canComplete
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-[0.98]"
            : "cursor-not-allowed bg-slate-800 text-slate-500"
        }`}
      >
        {isCompleting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-white" />
            Submitting...
          </span>
        ) : canComplete ? (
          "Complete Training"
        ) : (
          `${minScenarios - completedScenarios} more scenarios required`
        )}
      </button>
    </div>
  );
}
