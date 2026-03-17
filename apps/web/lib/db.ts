import { connectDB, Decision, type IDecision } from "@merlynn/db";
import { seedDecisions, seedUsers } from "./seed";

export async function ensureSeeded(): Promise<void> {
  await connectDB();
  const count = await Decision.countDocuments();
  if (count === 0) {
    await Decision.insertMany(seedDecisions);
  }
  await seedUsers();
}

export async function getDecisions(riskLevel?: string, limit?: number): Promise<IDecision[]> {
  await ensureSeeded();
  const filter = riskLevel ? { riskLevel } : {};
  let query = Decision.find(filter).sort({ timestamp: -1 });
  if (limit) {
    query = query.limit(limit);
  }
  const decisions = await query.lean();
  return decisions as unknown as IDecision[];
}

export async function getDecisionById(id: string): Promise<IDecision | null> {
  await ensureSeeded();
  const decision = await Decision.findById(id).lean();
  return decision as unknown as IDecision | null;
}

export interface DashboardStats {
  totalToday: number;
  highRisk: number;
  avgConfidence: number;
  accuracyRate: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await ensureSeeded();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalToday, highRisk, _totalAll, correctFeedback, totalFeedback, avgConfidenceResult] =
    await Promise.all([
      Decision.countDocuments({ timestamp: { $gte: today } }),
      Decision.countDocuments({ riskLevel: "HIGH" }),
      Decision.countDocuments(),
      Decision.countDocuments({ "feedback.rating": "CORRECT" }),
      Decision.countDocuments({ feedback: { $exists: true, $ne: null } }),
      Decision.aggregate([{ $group: { _id: null, avg: { $avg: "$confidence" } } }]),
    ]);

  const avgConfidence = avgConfidenceResult.length > 0 ? Math.round(avgConfidenceResult[0].avg) : 0;
  const accuracyRate = totalFeedback > 0 ? Math.round((correctFeedback / totalFeedback) * 100) : 0;

  return {
    totalToday,
    highRisk,
    avgConfidence,
    accuracyRate,
  };
}

export interface RiskBreakdown {
  high: number;
  medium: number;
  low: number;
  total: number;
}

export async function getRiskBreakdown(): Promise<RiskBreakdown> {
  await ensureSeeded();

  const [high, medium, low] = await Promise.all([
    Decision.countDocuments({ riskLevel: "HIGH" }),
    Decision.countDocuments({ riskLevel: "MEDIUM" }),
    Decision.countDocuments({ riskLevel: "LOW" }),
  ]);

  return { high, medium, low, total: high + medium + low };
}
