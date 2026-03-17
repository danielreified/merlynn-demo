"use server";

import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModelData = Record<string, any>;

async function getDb() {
  const { connectDB, DecisionModel } = await import("@merlynn/db");
  await connectDB();
  return { DecisionModel };
}

export async function listModels(): Promise<ModelData[]> {
  const { DecisionModel } = await getDb();
  const models = await DecisionModel.find().sort({ updatedAt: -1 }).lean();
  return JSON.parse(JSON.stringify(models));
}

export async function getModel(id: string): Promise<ModelData | null> {
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  const { DecisionModel } = await getDb();
  const model = await DecisionModel.findById(id).lean();
  if (!model) return null;
  return JSON.parse(JSON.stringify(model));
}

export async function createModel(data: {
  name: string;
  nodes?: unknown[];
  edges?: unknown[];
}): Promise<{ success: boolean; model?: ModelData; error?: string }> {
  try {
    const { DecisionModel } = await getDb();
    const model = await DecisionModel.create({
      ...data,
      nodes: data.nodes ?? [],
      edges: data.edges ?? [],
      status: "draft",
      createdBy: "system",
    });
    revalidatePath("/models");
    return { success: true, model: JSON.parse(JSON.stringify(model)) };
  } catch (error) {
    console.error("createModel error:", error);
    return { success: false, error: "Failed to create model" };
  }
}

export async function updateModel(
  id: string,
  updates: Record<string, unknown>
): Promise<{ success: boolean; model?: ModelData; error?: string }> {
  try {
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return { success: false, error: "Invalid model ID" };
    }
    const { DecisionModel } = await getDb();
    const model = await DecisionModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();
    if (!model) return { success: false, error: "Model not found" };
    revalidatePath("/models");
    revalidatePath(`/models/${id}/edit`);
    return { success: true, model: JSON.parse(JSON.stringify(model)) };
  } catch (error) {
    console.error("updateModel error:", error);
    return { success: false, error: "Failed to update model" };
  }
}

export async function deleteModel(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return { success: false, error: "Invalid model ID" };
    }
    const { DecisionModel } = await getDb();
    const model = await DecisionModel.findByIdAndDelete(id).lean();
    if (!model) return { success: false, error: "Model not found" };
    revalidatePath("/models");
    return { success: true };
  } catch (error) {
    console.error("deleteModel error:", error);
    return { success: false, error: "Failed to delete model" };
  }
}
