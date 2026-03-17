import type { Document, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

export type ModelStatus = "draft" | "training" | "deployed";
export type NodeType = "factor" | "decision" | "output";

export interface IModelNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  data: {
    description?: string;
    weight?: number;
    threshold?: number;
    riskLevel?: string;
    options?: string[];
  };
}

export interface IModelEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface IModel {
  name: string;
  description?: string;
  status: ModelStatus;
  nodes: IModelNode[];
  edges: IModelEdge[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IModelDocument extends IModel, Document {}

const NodeSchema = new Schema<IModelNode>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["factor", "decision", "output"],
    },
    label: { type: String, required: true, trim: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    data: {
      description: { type: String },
      weight: { type: Number },
      threshold: { type: Number },
      riskLevel: { type: String },
      options: { type: [String], default: undefined },
    },
  },
  { _id: false }
);

const EdgeSchema = new Schema<IModelEdge>(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    label: { type: String },
  },
  { _id: false }
);

const ModelSchema = new Schema<IModelDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: undefined,
    },
    status: {
      type: String,
      required: true,
      enum: ["draft", "training", "deployed"],
      default: "draft",
    },
    nodes: {
      type: [NodeSchema],
      required: true,
      default: [],
    },
    edges: {
      type: [EdgeSchema],
      required: true,
      default: [],
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const DecisionModel: Model<IModelDocument> =
  mongoose.models.DecisionModel ?? mongoose.model<IModelDocument>("DecisionModel", ModelSchema);
