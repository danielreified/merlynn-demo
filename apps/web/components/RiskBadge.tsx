"use client";

import React from "react";
import { Badge } from "@merlynn/ui";
import type { RiskLevel } from "@merlynn/db";

interface RiskBadgeProps {
  level: RiskLevel;
}

const variantMap: Record<RiskLevel, "high" | "medium" | "low"> = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

export function RiskBadge({ level }: RiskBadgeProps): React.JSX.Element {
  return <Badge variant={variantMap[level]}>{level}</Badge>;
}
