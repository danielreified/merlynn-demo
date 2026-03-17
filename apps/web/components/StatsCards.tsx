"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@merlynn/ui";

interface StatsCardsProps {
  totalToday: number;
  highRisk: number;
  accuracyRate: number;
  avgConfidence: number;
}

export function StatsCards({
  totalToday,
  highRisk,
  accuracyRate,
  avgConfidence,
}: StatsCardsProps): React.JSX.Element {
  const stats = [
    {
      title: "Total Today",
      value: totalToday,
      color: "text-white",
      borderColor: "border-slate-800",
    },
    {
      title: "High Risk Flagged",
      value: highRisk,
      color: "text-red-400",
      borderColor: "border-red-500/20",
    },
    {
      title: "Accuracy Rate",
      value: `${accuracyRate}%`,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Avg Confidence",
      value: `${avgConfidence}%`,
      color: "text-blue-400",
      borderColor: "border-blue-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="stat-cards">
      {stats.map((stat) => (
        <Card key={stat.title} className={stat.borderColor}>
          <CardHeader>
            <CardTitle>{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
