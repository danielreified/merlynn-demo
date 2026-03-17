import { z } from "@hono/zod-openapi";
import type { Context } from "hono";

// ---------------------------------------------------------------------------
// Shared defaultHook — preserves the current validation error format
// ---------------------------------------------------------------------------
export const defaultHook = (
  result: { success: boolean; error?: { issues: unknown[] } },
  c: Context
): Response | undefined => {
  if (!result.success) {
    return c.json({ error: "Validation failed", details: result.error?.issues }, 400);
  }
};

// ---------------------------------------------------------------------------
// Common schemas
// ---------------------------------------------------------------------------
export const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("Error");

export const IdParamSchema = z.object({
  id: z.string().min(1).openapi({ example: "507f1f77bcf86cd799439011" }),
});

// ---------------------------------------------------------------------------
// Decision schemas
// ---------------------------------------------------------------------------
const ShapValueSchema = z
  .object({
    factor: z.string(),
    contribution: z.number(),
  })
  .openapi("ShapValue");

const FeedbackSchema = z
  .object({
    rating: z.enum(["CORRECT", "PARTIAL", "INCORRECT"]),
    note: z.string().optional(),
    submittedBy: z.string().optional(),
    submittedAt: z.string().datetime().optional(),
  })
  .openapi("Feedback");

export const DecisionSchema = z
  .object({
    _id: z.string().openapi({ example: "507f1f77bcf86cd799439011" }),
    transactionId: z.string().openapi({ example: "TXN-2026-0301" }),
    amount: z.number().openapi({ example: 2450000 }),
    supplierName: z.string().openapi({ example: "Meridian Global Trading Ltd" }),
    country: z.string().openapi({ example: "Nigeria" }),
    transactionType: z.enum(["PAYMENT", "INVOICE", "TRANSFER", "REFUND", "PROCUREMENT"]),
    riskLevel: z.enum(["HIGH", "MEDIUM", "LOW"]),
    riskScore: z.number().openapi({ example: 75 }),
    confidence: z.number().openapi({ example: 89 }),
    outcome: z.enum(["FLAGGED", "PASSED", "REVIEWING"]),
    modelName: z.string().openapi({ example: "Fraud Analyst — Carl" }),
    explanation: z.string(),
    shapValues: z.array(ShapValueSchema),
    feedback: FeedbackSchema.nullable().optional(),
    timestamp: z.string().datetime(),
  })
  .openapi("Decision");

export const CreateDecisionSchema = z
  .object({
    amount: z.number().positive().openapi({ example: 500000 }),
    supplierName: z.string().min(1).openapi({ example: "Acme Corp" }),
    country: z.string().min(1).openapi({ example: "South Africa" }),
    transactionType: z.enum(["PAYMENT", "INVOICE", "TRANSFER", "REFUND", "PROCUREMENT"]),
  })
  .openapi("CreateDecisionInput");

export const DecisionListQuerySchema = z.object({
  page: z.string().optional().openapi({ example: "1" }),
  limit: z.string().optional().openapi({ example: "20" }),
  riskLevel: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  search: z.string().optional(),
  modelName: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const ExportQuerySchema = z.object({
  format: z.enum(["csv", "json"]).optional().openapi({ example: "csv" }),
  riskLevel: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  search: z.string().optional(),
  modelName: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const DecisionListResponseSchema = z.object({
  decisions: z.array(DecisionSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

// ---------------------------------------------------------------------------
// Model schemas
// ---------------------------------------------------------------------------
export const ModelSchema = z
  .object({
    _id: z.string(),
    name: z.string().openapi({ example: "Fraud Analyst — Carl" }),
    description: z.string().optional(),
    status: z.enum(["draft", "training", "deployed"]),
    nodes: z.array(z.record(z.string(), z.unknown())),
    edges: z.array(z.record(z.string(), z.unknown())),
    createdBy: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("Model");

export const CreateModelSchema = z
  .object({
    name: z.string().min(1).openapi({ example: "New Risk Model" }),
    description: z.string().optional(),
    nodes: z.array(z.record(z.string(), z.unknown())).optional(),
    edges: z.array(z.record(z.string(), z.unknown())).optional(),
  })
  .openapi("CreateModelInput");

export const UpdateModelSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(["draft", "training", "deployed"]).optional(),
    nodes: z.array(z.record(z.string(), z.unknown())).optional(),
    edges: z.array(z.record(z.string(), z.unknown())).optional(),
  })
  .openapi("UpdateModelInput");
