import { Hono } from "hono";
import { z } from "zod";
import { connectDB, DecisionModel } from "@merlynn/db";

const createModelSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
});

const updateModelSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "training", "deployed"]).optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
});

export const modelsRouter = new Hono()
  .get("/", async (c) => {
    try {
      await connectDB();
      const models = await DecisionModel.find().sort({ updatedAt: -1 }).lean();
      return c.json(models);
    } catch (error) {
      console.error("GET /api/models error:", error);
      return c.json({ error: "Failed to fetch models" }, 500);
    }
  })

  .get("/:id", async (c) => {
    try {
      await connectDB();
      const id = c.req.param("id");
      if (!/^[a-f\d]{24}$/i.test(id)) {
        return c.json({ error: "Invalid model ID" }, 400);
      }

      const model = await DecisionModel.findById(id).lean();
      if (!model) return c.json({ error: "Model not found" }, 404);

      return c.json(model);
    } catch (error) {
      console.error("GET /api/models/:id error:", error);
      return c.json({ error: "Failed to fetch model" }, 500);
    }
  })

  .post("/", async (c) => {
    try {
      await connectDB();
      const body = await c.req.json();

      const result = createModelSchema.safeParse(body);
      if (!result.success) {
        return c.json({ error: "Validation failed", details: result.error.issues }, 400);
      }

      const model = await DecisionModel.create({
        ...result.data,
        nodes: result.data.nodes ?? [],
        edges: result.data.edges ?? [],
        status: "draft",
        createdBy: "system",
      });

      return c.json(model, 201);
    } catch (error) {
      console.error("POST /api/models error:", error);
      return c.json({ error: "Failed to create model" }, 500);
    }
  })

  .put("/:id", async (c) => {
    try {
      await connectDB();
      const id = c.req.param("id");
      if (!/^[a-f\d]{24}$/i.test(id)) {
        return c.json({ error: "Invalid model ID" }, 400);
      }

      const body = await c.req.json();
      const result = updateModelSchema.safeParse(body);
      if (!result.success) {
        return c.json({ error: "Validation failed", details: result.error.issues }, 400);
      }

      const updates = result.data;
      if (Object.keys(updates).length === 0) {
        return c.json({ error: "No valid fields to update" }, 400);
      }

      const model = await DecisionModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      }).lean();

      if (!model) return c.json({ error: "Model not found" }, 404);
      return c.json(model);
    } catch (error) {
      console.error("PUT /api/models/:id error:", error);
      return c.json({ error: "Failed to update model" }, 500);
    }
  })

  .delete("/:id", async (c) => {
    try {
      await connectDB();
      const id = c.req.param("id");
      if (!/^[a-f\d]{24}$/i.test(id)) {
        return c.json({ error: "Invalid model ID" }, 400);
      }

      const model = await DecisionModel.findByIdAndDelete(id).lean();
      if (!model) return c.json({ error: "Model not found" }, 404);

      return c.json({ message: "Model deleted" });
    } catch (error) {
      console.error("DELETE /api/models/:id error:", error);
      return c.json({ error: "Failed to delete model" }, 500);
    }
  });
