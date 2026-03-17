import type { Document, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";
export type Outcome = "FLAGGED" | "PASSED" | "REVIEWING";
export type TransactionType = "PAYMENT" | "INVOICE" | "TRANSFER" | "REFUND" | "PROCUREMENT";
export type FeedbackRating = "CORRECT" | "PARTIAL" | "INCORRECT";

export interface ShapValue {
  factor: string;
  contribution: number;
}

export interface Feedback {
  rating: FeedbackRating;
  note?: string;
  submittedBy: string;
  submittedAt: Date;
}

export interface IDecision {
  transactionId: string;
  amount: number;
  supplierName: string;
  country: string;
  transactionType: TransactionType;
  riskLevel: RiskLevel;
  riskScore: number;
  confidence: number;
  modelName: string;
  explanation: string;
  shapValues: ShapValue[];
  outcome: Outcome;
  feedback?: Feedback;
  reviewedBy?: string;
  timestamp: Date;
}

export interface IDecisionDocument extends IDecision, Document {}

const ShapValueSchema = new Schema<ShapValue>(
  {
    factor: { type: String, required: true },
    contribution: { type: Number, required: true },
  },
  { _id: false }
);

const FeedbackSchema = new Schema<Feedback>(
  {
    rating: { type: String, required: true, enum: ["CORRECT", "PARTIAL", "INCORRECT"] },
    note: { type: String },
    submittedBy: { type: String, required: true },
    submittedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const DecisionSchema = new Schema<IDecisionDocument>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    supplierName: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    transactionType: {
      type: String,
      required: true,
      enum: ["PAYMENT", "INVOICE", "TRANSFER", "REFUND", "PROCUREMENT"],
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ["HIGH", "MEDIUM", "LOW"],
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 75,
    },
    modelName: {
      type: String,
      required: true,
      default: "Fraud Analyst — Carl",
    },
    explanation: {
      type: String,
      required: true,
    },
    shapValues: {
      type: [ShapValueSchema],
      required: true,
      default: [],
    },
    outcome: {
      type: String,
      required: true,
      enum: ["FLAGGED", "PASSED", "REVIEWING"],
    },
    feedback: {
      type: FeedbackSchema,
      default: undefined,
    },
    reviewedBy: {
      type: String,
      default: undefined,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Decision: Model<IDecisionDocument> =
  mongoose.models.Decision ?? mongoose.model<IDecisionDocument>("Decision", DecisionSchema);
