import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { connectDB, DecisionModel } from "@merlynn/db";
import {
  defaultHook,
  ModelSchema,
  CreateModelSchema,
  UpdateModelSchema,
  IdParamSchema,
  ErrorSchema,
} from "./schemas";

const app = new OpenAPIHono({ defaultHook });

// ---- GET / — List all models ----

const listModelsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Models"],
  summary: "List models",
  description: "Retrieve all decision models, sorted by last updated.",
  responses: {
    200: {
      description: "List of models",
      content: { "application/json": { schema: z.array(ModelSchema) } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

// @ts-expect-error — Mongoose lean() types don't match Zod schema output types
app.openapi(listModelsRoute, async (c) => {
  try {
    await connectDB();
    const models = await DecisionModel.find().sort({ updatedAt: -1 }).lean();
    return c.json(models);
  } catch (error) {
    console.error("GET /api/models error:", error);
    return c.json({ error: "Failed to fetch models" }, 500);
  }
});

// ---- GET /:id — Get single model ----

const getModelRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Models"],
  summary: "Get model by ID",
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: "Model details",
      content: { "application/json": { schema: ModelSchema } },
    },
    400: {
      description: "Invalid ID",
      content: { "application/json": { schema: ErrorSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

// @ts-expect-error — Mongoose lean() types don't match Zod schema output types
app.openapi(getModelRoute, async (c) => {
  try {
    await connectDB();
    const { id } = c.req.valid("param");
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
});

// ---- POST / — Create a model ----

const createModelRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Models"],
  summary: "Create a model",
  request: {
    body: {
      content: { "application/json": { schema: CreateModelSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Model created",
      content: { "application/json": { schema: ModelSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

// @ts-expect-error — Mongoose document types don't match Zod schema output types
app.openapi(createModelRoute, async (c) => {
  try {
    await connectDB();
    const data = c.req.valid("json");

    const model = await DecisionModel.create({
      ...data,
      nodes: data.nodes ?? [],
      edges: data.edges ?? [],
      status: "draft",
      createdBy: "system",
    });

    return c.json(model, 201);
  } catch (error) {
    console.error("POST /api/models error:", error);
    return c.json({ error: "Failed to create model" }, 500);
  }
});

// ---- PUT /:id — Update a model ----

const updateModelRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Models"],
  summary: "Update a model",
  request: {
    params: IdParamSchema,
    body: {
      content: { "application/json": { schema: UpdateModelSchema } },
    },
  },
  responses: {
    200: {
      description: "Updated model",
      content: { "application/json": { schema: ModelSchema } },
    },
    400: {
      description: "Validation error or no fields to update",
      content: { "application/json": { schema: ErrorSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

// @ts-expect-error — Mongoose lean() types don't match Zod schema output types
app.openapi(updateModelRoute, async (c) => {
  try {
    await connectDB();
    const { id } = c.req.valid("param");
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return c.json({ error: "Invalid model ID" }, 400);
    }

    const updates = c.req.valid("json");
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
});

// ---- DELETE /:id — Delete a model ----

const deleteModelRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Models"],
  summary: "Delete a model",
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: "Model deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    400: {
      description: "Invalid ID",
      content: { "application/json": { schema: ErrorSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

// @ts-expect-error — catch block returns 500 which isn't in the route definition
app.openapi(deleteModelRoute, async (c) => {
  try {
    await connectDB();
    const { id } = c.req.valid("param");
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return c.json({ error: "Invalid model ID" }, 400);
    }

    const model = await DecisionModel.findByIdAndDelete(id).lean();
    if (!model) return c.json({ error: "Model not found" }, 404);

    return c.json({ message: "Model deleted" }, 200);
  } catch (error) {
    console.error("DELETE /api/models/:id error:", error);
    return c.json({ error: "Failed to delete model" }, 500);
  }
});

export const modelsRouter = app;
