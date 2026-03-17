import type { RiskLevel, Outcome, TransactionType } from "@merlynn/db";

export interface RiskAssessmentInput {
  amount: number;
  supplierName: string;
  country: string;
  transactionType: TransactionType;
}

export interface RiskAssessmentResult {
  riskLevel: RiskLevel;
  riskScore: number;
  explanation: string;
  shapValues: { factor: string; contribution: number }[];
  outcome: Outcome;
}

export function simulateRiskAssessment(input: RiskAssessmentInput): RiskAssessmentResult {
  const highRiskCountries = [
    "Nigeria",
    "Venezuela",
    "Russia",
    "North Korea",
    "Myanmar",
    "Belarus",
    "Iran",
  ];
  const mediumRiskCountries = [
    "China",
    "Turkey",
    "UAE",
    "Brazil",
    "Pakistan",
    "Bangladesh",
    "Angola",
    "Mozambique",
  ];

  let score = 20;
  const shapValues: { factor: string; contribution: number }[] = [];

  if (highRiskCountries.includes(input.country)) {
    score += 30;
    shapValues.push({ factor: "jurisdiction_risk", contribution: 0.3 });
  } else if (mediumRiskCountries.includes(input.country)) {
    score += 15;
    shapValues.push({ factor: "jurisdiction_risk", contribution: 0.15 });
  } else {
    score -= 10;
    shapValues.push({ factor: "jurisdiction_risk", contribution: -0.1 });
  }

  if (input.amount > 1000000) {
    score += 25;
    shapValues.push({ factor: "amount_anomaly", contribution: 0.25 });
  } else if (input.amount > 500000) {
    score += 10;
    shapValues.push({ factor: "amount_anomaly", contribution: 0.1 });
  } else {
    shapValues.push({ factor: "amount_anomaly", contribution: -0.05 });
  }

  shapValues.push({ factor: "supplier_tenure", contribution: 0.15 });
  score += 15;

  score = Math.max(0, Math.min(100, score));

  const riskLevel: RiskLevel = score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
  const outcome: Outcome = score >= 70 ? "FLAGGED" : score >= 40 ? "REVIEWING" : "PASSED";

  const explanation = `Automated risk assessment for ${input.transactionType.toLowerCase()} of $${input.amount.toLocaleString()} to ${input.supplierName} in ${input.country}. Risk score: ${score}/100. ${riskLevel === "HIGH" ? "Transaction flagged for manual review." : riskLevel === "MEDIUM" ? "Transaction under enhanced monitoring." : "Transaction approved within normal parameters."}`;

  return { riskLevel, riskScore: score, explanation, shapValues, outcome };
}
