"use server";

import { revalidatePath } from "next/cache";
import { connectDB, Decision, type IDecision, type TransactionType } from "@merlynn/db";
import { simulateRiskAssessment } from "@/lib/risk";

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

    await connectDB();

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
  await connectDB();
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
    await connectDB();

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
