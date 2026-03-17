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
      type: [Schema.Types.Mixed] as unknown as IModelNode[],
      required: true,
      default: [],
    },
    edges: {
      type: [Schema.Types.Mixed] as unknown as IModelEdge[],
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
