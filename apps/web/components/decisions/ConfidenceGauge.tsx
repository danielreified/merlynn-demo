"use client";

import React from "react";

interface ConfidenceGaugeProps {
  value: number;
  size?: number;
}

export function ConfidenceGauge({ value, size = 120 }: ConfidenceGaugeProps): React.JSX.Element {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const color =
    value >= 80
      ? "text-emerald-400 stroke-emerald-400"
      : value >= 60
        ? "text-amber-400 stroke-amber-400"
        : "text-red-400 stroke-red-400";

  const trackColor =
    value >= 80
      ? "stroke-emerald-500/15"
      : value >= 60
        ? "stroke-amber-500/15"
        : "stroke-red-500/15";

  return (
    <div className="flex flex-col items-center gap-2">
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
          className={`${color.split(" ")[1]} transition-all duration-700`}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className={`fill-current ${color.split(" ")[0]} origin-center rotate-90`}
          style={{ fontSize: size * 0.28, fontWeight: 700 }}
        >
          {value}%
        </text>
      </svg>
      <span className="text-xs text-slate-500">Confidence</span>
    </div>
  );
}
