import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { apiReference } from "@scalar/hono-api-reference";
import { decisionsRouter } from "@/lib/api/decisions";
import { modelsRouter } from "@/lib/api/models";
import { flexAuth } from "@/lib/api/auth";

const app = new OpenAPIHono().basePath("/api");

// Middleware
app.use("*", cors());
app.use("*", logger());

// Health check (unprotected)
const healthRoute = createRoute({
  method: "get",
  path: "/health",
  tags: ["System"],
  summary: "Health check",
  security: [],
  responses: {
    200: {
      description: "API is healthy",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string().openapi({ example: "ok" }),
            timestamp: z.string().datetime(),
          }),
        },
      },
    },
  },
});

app.openapi(healthRoute, (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Security schemes
app.openAPIRegistry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  description: "API key generated from Settings. Format: mk_live_...",
});
app.openAPIRegistry.registerComponent("securitySchemes", "SessionAuth", {
  type: "apiKey",
  in: "cookie",
  name: "next-auth.session-token",
  description: "Next.js session cookie (internal use)",
});

// Auto-generated OpenAPI spec
app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Merlynn Risk Monitor API",
    description:
      "REST API for the Merlynn digital decision model platform. Manage risk decisions, decision models, and training workflows.",
    version: "1.0.0",
    contact: { name: "Merlynn", url: "https://merlynn.co.za" },
  },
  servers: [{ url: "/", description: "Current environment" }],
  security: [{ BearerAuth: [] }],
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
