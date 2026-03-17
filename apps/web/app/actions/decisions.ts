"use server";

import { revalidatePath } from "next/cache";
import type { IDecision, TransactionType } from "@merlynn/db";
import { simulateRiskAssessment } from "@/lib/risk";

async function getDb() {
  const { connectDB, Decision } = await import("@merlynn/db");
  await connectDB();
  return { Decision };
}

async function getDbSeeded() {
  const { ensureSeeded } = await import("@/lib/db");
  await ensureSeeded();
  const { Decision } = await import("@merlynn/db");
  return { Decision };
}

/* ---------- List decisions with pagination & filters ---------- */

export interface DecisionFilters {
  page?: string;
  limit?: string;
  riskLevel?: string;
  search?: string;
  modelName?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DecisionsListResult {
  decisions: (IDecision & { _id: string })[];
  total: number;
  page: number;
  totalPages: number;
}

export async function listDecisions(filters: DecisionFilters = {}): Promise<DecisionsListResult> {
  const { Decision } = await getDbSeeded();

  const page = Math.max(1, parseInt(filters.page ?? "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(filters.limit ?? "20", 10)));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (filters.riskLevel) filter.riskLevel = filters.riskLevel;
  if (filters.search) {
    const regex = { $regex: filters.search, $options: "i" };
    filter.$or = [{ supplierName: regex }, { transactionId: regex }];
  }
  if (filters.modelName) filter.modelName = filters.modelName;
  if (filters.dateFrom || filters.dateTo) {
    filter.timestamp = {};
    if (filters.dateFrom) filter.timestamp.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      filter.timestamp.$lte = to;
    }
  }

  const total = await Decision.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const decisions = await Decision.find(filter)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return JSON.parse(JSON.stringify({ decisions, total, page, totalPages }));
}

/* ---------- Export decisions as CSV or JSON ---------- */

export async function exportDecisions(
  filters: DecisionFilters = {},
  format: "csv" | "json" = "csv"
): Promise<{ data: string; format: "csv" | "json" }> {
  const { Decision } = await getDbSeeded();
  const Papa = (await import("papaparse")).default;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (filters.riskLevel) filter.riskLevel = filters.riskLevel;
  if (filters.search) {
    const regex = { $regex: filters.search, $options: "i" };
    filter.$or = [{ supplierName: regex }, { transactionId: regex }];
  }
  if (filters.modelName) filter.modelName = filters.modelName;
  if (filters.dateFrom || filters.dateTo) {
    filter.timestamp = {};
    if (filters.dateFrom) filter.timestamp.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      filter.timestamp.$lte = to;
    }
  }

  const decisions = await Decision.find(filter).sort({ timestamp: -1 }).limit(10000).lean();

  const rows = decisions.map((d) => ({
    "Transaction ID": d.transactionId,
    Model: d.modelName,
    Supplier: d.supplierName,
    Amount: d.amount,
    Country: d.country,
    "Risk Level": d.riskLevel,
    "Risk Score": d.riskScore,
    Confidence: d.confidence,
    Outcome: d.outcome,
    Feedback: d.feedback?.rating ?? "",
    Timestamp: new Date(d.timestamp).toISOString(),
    Explanation: d.explanation ?? "",
  }));

  if (format === "json") {
    return { data: JSON.stringify(rows, null, 2), format: "json" };
  }

  return { data: Papa.unparse(rows), format: "csv" };
}

export interface CreateDecisionState {
  success: boolean;
  error?: string;
  decision?: IDecision;
}

const VALID_TYPES: TransactionType[] = ["PAYMENT", "INVOICE", "TRANSFER", "REFUND", "PROCUREMENT"];

export async function createDecision(
  _prevState: CreateDecisionState,
  formData: FormData
): Promise<CreateDecisionState> {
  try {
    const amount = parseFloat(formData.get("amount") as string);
    const supplierName = (formData.get("supplierName") as string)?.trim();
    const country = (formData.get("country") as string)?.trim();
    const transactionType = formData.get("transactionType") as TransactionType;

    if (!supplierName || !country || !transactionType) {
      return { success: false, error: "All fields are required" };
    }

    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Amount must be a positive number" };
    }

    if (!VALID_TYPES.includes(transactionType)) {
      return {
        success: false,
        error: `Invalid transaction type. Must be one of: ${VALID_TYPES.join(", ")}`,
      };
    }

    const { Decision } = await getDb();

    const assessment = simulateRiskAssessment({
      amount,
      supplierName,
      country,
      transactionType,
    });

    const transactionId = `TXN-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

    const decision = await Decision.create({
      transactionId,
      amount,
      supplierName,
      country,
      transactionType,
      ...assessment,
      timestamp: new Date(),
    });

    revalidatePath("/dashboard");

    const plainDecision = decision.toObject() as unknown as IDecision;
    return { success: true, decision: plainDecision };
  } catch (error) {
    console.error("createDecision error:", error);
    return { success: false, error: "Failed to create decision" };
  }
}

export async function getDecisionsByRisk(riskLevel?: string): Promise<IDecision[]> {
  const { Decision } = await getDb();
  const filter: Record<string, string> = {};
  if (riskLevel && ["HIGH", "MEDIUM", "LOW"].includes(riskLevel)) {
    filter.riskLevel = riskLevel;
  }
  const decisions = await Decision.find(filter).sort({ timestamp: -1 }).lean();
  return decisions as unknown as IDecision[];
}

export interface FeedbackState {
  success: boolean;
  error?: string;
}

export async function submitFeedback(
  decisionId: string,
  rating: "CORRECT" | "PARTIAL" | "INCORRECT",
  note?: string
): Promise<FeedbackState> {
  try {
    const { Decision } = await getDb();

    const validRatings = ["CORRECT", "PARTIAL", "INCORRECT"];
    if (!validRatings.includes(rating)) {
      return { success: false, error: "Invalid rating" };
    }

    await Decision.findByIdAndUpdate(decisionId, {
      feedback: {
        rating,
        note,
        submittedBy: "analyst@merlynn.co.za",
        submittedAt: new Date(),
      },
    });

    revalidatePath(`/decisions/${decisionId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("submitFeedback error:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
}
