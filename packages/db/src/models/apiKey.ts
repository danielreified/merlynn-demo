import type { Document, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IApiKey {
  name: string;
  keyHash: string;
  prefix: string;
  createdBy: string;
  lastUsedAt?: Date;
  expiresAt?: Date;
  revoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IApiKeyDocument extends IApiKey, Document {}

const ApiKeySchema = new Schema<IApiKeyDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    keyHash: {
      type: String,
      required: true,
      index: true,
    },
    prefix: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    lastUsedAt: {
      type: Date,
      default: undefined,
    },
    expiresAt: {
      type: Date,
      default: undefined,
    },
    revoked: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const ApiKey: Model<IApiKeyDocument> =
  mongoose.models.ApiKey ?? mongoose.model<IApiKeyDocument>("ApiKey", ApiKeySchema);
