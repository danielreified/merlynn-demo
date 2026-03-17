import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import Papa from "papaparse";
import { connectDB, Decision } from "@merlynn/db";
import { ensureSeeded } from "@/lib/db";
import { simulateRiskAssessment } from "@/lib/risk";
import {
  defaultHook,
  DecisionSchema,
  CreateDecisionSchema,
  DecisionListQuerySchema,
  DecisionListResponseSchema,
  ExportQuerySchema,
  IdParamSchema,
  ErrorSchema,
} from "./schemas";

const app = new OpenAPIHono({ defaultHook });

// ---- GET / — List with filters and pagination ----

const listDecisionsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Decisions"],
  summary: "List decisions",
  description: "Retrieve paginated, filterable list of risk decisions.",
  request: { query: DecisionListQuerySchema },
  responses: {
    200: {
      description: "Paginated list of decisions",
      content: { "application/json": { schema: DecisionListResponseSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

// @ts-expect-error — Mongoose lean() types don't match Zod schema output types
app.openapi(listDecisionsRoute, async (c) => {
  try {
    await ensureSeeded();

    const q = c.req.valid("query");
    const page = Math.max(1, parseInt(q.page ?? "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(q.limit ?? "20", 10)));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (q.riskLevel) filter.riskLevel = q.riskLevel;
    if (q.search) {
      const regex = { $regex: q.search, $options: "i" };
      filter.$or = [{ supplierName: regex }, { transactionId: regex }];
    }
    if (q.modelName) filter.modelName = q.modelName;
    if (q.dateFrom || q.dateTo) {
      filter.timestamp = {};
      if (q.dateFrom) filter.timestamp.$gte = new Date(q.dateFrom);
      if (q.dateTo) {
        const to = new Date(q.dateTo);
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

    return c.json({ decisions, total, page, totalPages });
  } catch (error) {
    console.error("GET /api/decisions error:", error);
    return c.json({ error: "Failed to fetch decisions" }, 500);
  }
});

// ---- GET /export — Export filtered decisions as CSV or JSON ----

const exportDecisionsRoute = createRoute({
  method: "get",
  path: "/export",
  tags: ["Decisions"],
  summary: "Export decisions",
  description:
    "Export filtered decisions as CSV or JSON. Applies the same filters as the list endpoint.",
  request: { query: ExportQuerySchema },
  responses: {
    200: {
      description: "CSV or JSON file download",
      content: {
        "text/csv": { schema: z.string() },
        "application/json": {
          schema: z.array(z.record(z.string(), z.unknown())),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

app.openapi(exportDecisionsRoute, async (c) => {
  try {
    await ensureSeeded();

    const q = c.req.valid("query");
    const format = q.format ?? "csv";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (q.riskLevel) filter.riskLevel = q.riskLevel;
    if (q.search) {
      const regex = { $regex: q.search, $options: "i" };
      filter.$or = [{ supplierName: regex }, { transactionId: regex }];
    }
    if (q.modelName) filter.modelName = q.modelName;
    if (q.dateFrom || q.dateTo) {
      filter.timestamp = {};
      if (q.dateFrom) filter.timestamp.$gte = new Date(q.dateFrom);
      if (q.dateTo) {
        const to = new Date(q.dateTo);
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
      c.header("Content-Disposition", "attachment; filename=decisions.json");
      return c.json(rows);
    }

    const csv = Papa.unparse(rows);
    c.header("Content-Type", "text/csv; charset=utf-8");
    c.header("Content-Disposition", "attachment; filename=decisions.csv");
    return c.body(csv);
  } catch (error) {
    console.error("GET /api/decisions/export error:", error);
    return c.json({ error: "Failed to export decisions" }, 500);
  }
});

// ---- GET /:id — Get single decision ----

const getDecisionRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Decisions"],
  summary: "Get decision by ID",
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: "Decision details",
      content: { "application/json": { schema: DecisionSchema } },
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
app.openapi(getDecisionRoute, async (c) => {
  try {
    await ensureSeeded();
    const { id } = c.req.valid("param");

    if (!/^[a-f\d]{24}$/i.test(id)) {
      return c.json({ error: "Invalid decision ID" }, 400);
    }

    const decision = await Decision.findById(id).lean();
    if (!decision) return c.json({ error: "Decision not found" }, 404);

    return c.json(decision);
  } catch (error) {
    console.error("GET /api/decisions/:id error:", error);
    return c.json({ error: "Failed to fetch decision" }, 500);
  }
});

// ---- POST / — Create new decision ----

const createDecisionRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Decisions"],
  summary: "Create a decision",
  description: "Submit a new transaction for automated risk assessment.",
  request: {
    body: {
      content: { "application/json": { schema: CreateDecisionSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Decision created",
      content: { "application/json": { schema: DecisionSchema } },
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
app.openapi(createDecisionRoute, async (c) => {
  try {
    await connectDB();
    const data = c.req.valid("json");

    const assessment = simulateRiskAssessment(data);
    const transactionId = `TXN-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

    const decision = await Decision.create({
      transactionId,
      ...data,
      ...assessment,
      timestamp: new Date(),
    });

    return c.json(decision, 201);
  } catch (error) {
    console.error("POST /api/decisions error:", error);
    return c.json({ error: "Failed to create decision" }, 500);
  }
});

export const decisionsRouter = app;
