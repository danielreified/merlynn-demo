import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { apiReference } from "@scalar/hono-api-reference";
import { decisionsRouter } from "@/lib/api/decisions";
import { modelsRouter } from "@/lib/api/models";
import { flexAuth } from "@/lib/api/auth";

const app = new Hono().basePath("/api");

// Middleware
app.use("*", cors());
app.use("*", logger());

// Health check (unprotected)
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// OpenAPI spec
app.get("/openapi.json", (c) => {
  return c.json({
    openapi: "3.1.0",
    info: {
      title: "Merlynn Risk Monitor API",
      description:
        "REST API for the Merlynn digital decision model platform. Manage risk decisions, decision models, and training workflows.",
      version: "1.0.0",
      contact: { name: "Merlynn", url: "https://merlynn.co.za" },
    },
    servers: [{ url: "/api", description: "Current environment" }],
    security: [{ BearerAuth: [] }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "API key generated from Settings. Format: mk_live_...",
        },
        SessionAuth: {
          type: "apiKey",
          in: "cookie",
          name: "next-auth.session-token",
          description: "Next.js session cookie (internal use)",
        },
      },
      schemas: {
        Decision: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            transactionId: { type: "string", example: "TXN-2026-0301" },
            amount: { type: "number", example: 2450000 },
            supplierName: { type: "string", example: "Meridian Global Trading Ltd" },
            country: { type: "string", example: "Nigeria" },
            transactionType: {
              type: "string",
              enum: ["PAYMENT", "INVOICE", "TRANSFER", "REFUND", "PROCUREMENT"],
            },
            riskLevel: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
            riskScore: { type: "number", example: 75 },
            confidence: { type: "number", example: 89 },
            outcome: { type: "string", enum: ["FLAGGED", "PASSED", "REVIEWING"] },
            modelName: { type: "string", example: "Fraud Analyst — Carl" },
            explanation: { type: "string" },
            shapValues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  factor: { type: "string" },
                  contribution: { type: "number" },
                },
              },
            },
            feedback: {
              type: "object",
              nullable: true,
              properties: {
                rating: { type: "string", enum: ["CORRECT", "PARTIAL", "INCORRECT"] },
                note: { type: "string" },
                submittedBy: { type: "string" },
                submittedAt: { type: "string", format: "date-time" },
              },
            },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        Model: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Fraud Analyst — Carl" },
            description: { type: "string" },
            status: { type: "string", enum: ["draft", "training", "deployed"] },
            nodes: { type: "array", items: { type: "object" } },
            edges: { type: "array", items: { type: "object" } },
            createdBy: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    paths: {
      "/decisions": {
        get: {
          tags: ["Decisions"],
          summary: "List decisions",
          description: "Retrieve paginated, filterable list of risk decisions.",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
            {
              name: "riskLevel",
              in: "query",
              schema: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
            },
            {
              name: "search",
              in: "query",
              schema: { type: "string" },
              description: "Search supplier name or transaction ID",
            },
            { name: "modelName", in: "query", schema: { type: "string" } },
            { name: "dateFrom", in: "query", schema: { type: "string", format: "date" } },
            { name: "dateTo", in: "query", schema: { type: "string", format: "date" } },
          ],
          responses: {
            "200": {
              description: "Paginated list of decisions",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      decisions: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Decision" },
                      },
                      total: { type: "integer" },
                      page: { type: "integer" },
                      totalPages: { type: "integer" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
        post: {
          tags: ["Decisions"],
          summary: "Create a decision",
          description: "Submit a new transaction for automated risk assessment.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["amount", "supplierName", "country", "transactionType"],
                  properties: {
                    amount: { type: "number", example: 500000 },
                    supplierName: { type: "string", example: "Acme Corp" },
                    country: { type: "string", example: "South Africa" },
                    transactionType: {
                      type: "string",
                      enum: ["PAYMENT", "INVOICE", "TRANSFER", "REFUND", "PROCUREMENT"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Decision created",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Decision" } },
              },
            },
            "400": {
              description: "Validation error",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/decisions/export": {
        get: {
          tags: ["Decisions"],
          summary: "Export decisions",
          description:
            "Export filtered decisions as CSV or JSON. Applies the same filters as the list endpoint.",
          parameters: [
            {
              name: "format",
              in: "query",
              schema: { type: "string", enum: ["csv", "json"], default: "csv" },
            },
            {
              name: "riskLevel",
              in: "query",
              schema: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
            },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "modelName", in: "query", schema: { type: "string" } },
            { name: "dateFrom", in: "query", schema: { type: "string", format: "date" } },
            { name: "dateTo", in: "query", schema: { type: "string", format: "date" } },
          ],
          responses: {
            "200": {
              description: "CSV or JSON file download",
              content: {
                "text/csv": { schema: { type: "string" } },
                "application/json": { schema: { type: "array", items: { type: "object" } } },
              },
            },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/decisions/{id}": {
        get: {
          tags: ["Decisions"],
          summary: "Get decision by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": {
              description: "Decision details",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Decision" } },
              },
            },
            "404": { description: "Not found" },
          },
        },
      },
      "/models": {
        get: {
          tags: ["Models"],
          summary: "List models",
          description: "Retrieve all decision models, sorted by last updated.",
          responses: {
            "200": {
              description: "List of models",
              content: {
                "application/json": {
                  schema: { type: "array", items: { $ref: "#/components/schemas/Model" } },
                },
              },
            },
          },
        },
        post: {
          tags: ["Models"],
          summary: "Create a model",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string", example: "New Risk Model" },
                    description: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Model created",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Model" } } },
            },
            "400": { description: "Validation error" },
          },
        },
      },
      "/models/{id}": {
        get: {
          tags: ["Models"],
          summary: "Get model by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": {
              description: "Model details",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Model" } } },
            },
            "404": { description: "Not found" },
          },
        },
        put: {
          tags: ["Models"],
          summary: "Update a model",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    status: { type: "string", enum: ["draft", "training", "deployed"] },
                    nodes: { type: "array", items: { type: "object" } },
                    edges: { type: "array", items: { type: "object" } },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated model",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Model" } } },
            },
            "404": { description: "Not found" },
          },
        },
        delete: {
          tags: ["Models"],
          summary: "Delete a model",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Model deleted" },
            "404": { description: "Not found" },
          },
        },
      },
      "/health": {
        get: {
          tags: ["System"],
          summary: "Health check",
          security: [],
          responses: {
            "200": {
              description: "API is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      timestamp: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
});

// API Docs (unprotected)
app.get(
  "/docs",
  apiReference({
    url: "/api/openapi.json",
    theme: "moon",
    pageTitle: "Merlynn API Reference",
  })
);

// Auth middleware for protected routes
app.use("/decisions/*", flexAuth);
app.use("/models/*", flexAuth);

// Mount routers
app.route("/decisions", decisionsRouter);
app.route("/models", modelsRouter);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
