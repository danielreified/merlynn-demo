import { describe, it, expect, beforeAll, afterAll, afterEach } from "bun:test";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Decision, type IDecision } from "../src";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Decision.deleteMany({});
});

const validDecision: IDecision = {
  transactionId: "TXN-2024-001",
  amount: 145000,
  supplierName: "Acme Corp",
  country: "Nigeria",
  transactionType: "PAYMENT",
  riskLevel: "HIGH",
  riskScore: 87,
  explanation: "High-value transaction to high-risk jurisdiction with new supplier.",
  shapValues: [
    { factor: "country_risk", contribution: 0.35 },
    { factor: "amount_threshold", contribution: 0.28 },
    { factor: "supplier_history", contribution: 0.22 },
  ],
  outcome: "FLAGGED",
  reviewedBy: "analyst@merlynn.co.za",
  timestamp: new Date("2024-12-15T10:30:00Z"),
};

describe("Decision Model", () => {
  it("should create a decision successfully", async () => {
    const decision = await Decision.create(validDecision);

    expect(decision.transactionId).toBe("TXN-2024-001");
    expect(decision.amount).toBe(145000);
    expect(decision.riskLevel).toBe("HIGH");
    expect(decision.riskScore).toBe(87);
    expect(decision.shapValues).toHaveLength(3);
    expect(decision.outcome).toBe("FLAGGED");
    expect(decision._id).toBeDefined();
  });

  it("should read decisions with filters", async () => {
    await Decision.create(validDecision);
    await Decision.create({
      ...validDecision,
      transactionId: "TXN-2024-002",
      riskLevel: "LOW",
      riskScore: 12,
      outcome: "PASSED",
    });

    const allDecisions = await Decision.find({});
    expect(allDecisions).toHaveLength(2);

    const highRisk = await Decision.find({ riskLevel: "HIGH" });
    expect(highRisk).toHaveLength(1);
    expect(highRisk[0]?.transactionId).toBe("TXN-2024-001");
  });

  it("should reject invalid riskLevel", async () => {
    expect(
      Decision.create({ ...validDecision, transactionId: "TXN-BAD-1", riskLevel: "EXTREME" })
    ).rejects.toThrow();
  });

  it("should reject invalid outcome", async () => {
    expect(
      Decision.create({ ...validDecision, transactionId: "TXN-BAD-2", outcome: "UNKNOWN" })
    ).rejects.toThrow();
  });

  it("should reject riskScore out of range", async () => {
    expect(
      Decision.create({ ...validDecision, transactionId: "TXN-BAD-3", riskScore: 150 })
    ).rejects.toThrow();
  });

  it("should reject negative amount", async () => {
    expect(
      Decision.create({ ...validDecision, transactionId: "TXN-BAD-4", amount: -100 })
    ).rejects.toThrow();
  });

  it("should require transactionId", async () => {
    const { transactionId: _transactionId, ...noTxnId } = validDecision;
    expect(Decision.create(noTxnId)).rejects.toThrow();
  });

  it("should enforce unique transactionId", async () => {
    await Decision.create(validDecision);
    expect(Decision.create(validDecision)).rejects.toThrow();
  });
});
