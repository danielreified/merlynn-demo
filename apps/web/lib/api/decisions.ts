import { Hono } from "hono";
import { z } from "zod";
import Papa from "papaparse";
import { connectDB, Decision } from "@merlynn/db";
import { ensureSeeded } from "@/lib/db";
import { simulateRiskAssessment } from "@/lib/risk";

// Zod schemas for validation
const createDecisionSchema = z.object({
  amount: z.number().positive(),
  supplierName: z.string().min(1),
  country: z.string().min(1),
  transactionType: z.enum(["PAYMENT", "INVOICE", "TRANSFER", "REFUND", "PROCUREMENT"]),
});

export const decisionsRouter = new Hono()
  // GET /api/decisions - List with filters and pagination
  .get("/", async (c) => {
    try {
      await ensureSeeded();

      const riskLevel = c.req.query("riskLevel");
      const search = c.req.query("search");
      const modelName = c.req.query("modelName");
      const dateFrom = c.req.query("dateFrom");
      const dateTo = c.req.query("dateTo");
      const page = Math.max(1, parseInt(c.req.query("page") ?? "1", 10));
      const limit = Math.max(1, Math.min(100, parseInt(c.req.query("limit") ?? "20", 10)));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filter: Record<string, any> = {};

      if (riskLevel && ["HIGH", "MEDIUM", "LOW"].includes(riskLevel)) {
        filter.riskLevel = riskLevel;
      }
      if (search) {
        const regex = { $regex: search, $options: "i" };
        filter.$or = [{ supplierName: regex }, { transactionId: regex }];
      }
      if (modelName) {
        filter.modelName = modelName;
      }
      if (dateFrom || dateTo) {
        filter.timestamp = {};
        if (dateFrom) filter.timestamp.$gte = new Date(dateFrom);
        if (dateTo) {
          const to = new Date(dateTo);
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
  })

  // GET /api/decisions/export - Export filtered decisions as CSV
  .get("/export", async (c) => {
    try {
      await ensureSeeded();

      const riskLevel = c.req.query("riskLevel");
      const search = c.req.query("search");
      const modelName = c.req.query("modelName");
      const dateFrom = c.req.query("dateFrom");
      const dateTo = c.req.query("dateTo");
      const format = c.req.query("format") ?? "csv";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filter: Record<string, any> = {};

      if (riskLevel && ["HIGH", "MEDIUM", "LOW"].includes(riskLevel)) {
        filter.riskLevel = riskLevel;
      }
      if (search) {
        const regex = { $regex: search, $options: "i" };
        filter.$or = [{ supplierName: regex }, { transactionId: regex }];
      }
      if (modelName) {
        filter.modelName = modelName;
      }
      if (dateFrom || dateTo) {
        filter.timestamp = {};
        if (dateFrom) filter.timestamp.$gte = new Date(dateFrom);
        if (dateTo) {
          const to = new Date(dateTo);
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
  })

  // GET /api/decisions/:id - Get single decision
  .get("/:id", async (c) => {
    try {
      await ensureSeeded();
      const id = c.req.param("id");

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
  })

  // POST /api/decisions - Create new decision
  .post("/", async (c) => {
    try {
      await connectDB();
      const body = await c.req.json();

      const result = createDecisionSchema.safeParse(body);
      if (!result.success) {
        return c.json({ error: "Validation failed", details: result.error.issues }, 400);
      }

      const data = result.data;
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
