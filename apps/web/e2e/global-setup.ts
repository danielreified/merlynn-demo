import { chromium, type FullConfig } from "@playwright/test";
import mongoose from "mongoose";

const SEED_DECISIONS = [
  {
    transactionId: "E2E-TXN-001",
    amount: 2450000,
    supplierName: "Meridian Global Trading Ltd",
    country: "Nigeria",
    transactionType: "PAYMENT",
    riskLevel: "HIGH",
    riskScore: 94,
    confidence: 89,
    modelName: "Fraud Analyst — Carl",
    explanation:
      "Unusually large payment to a newly onboarded supplier in a high-risk jurisdiction.",
    shapValues: [
      { factor: "jurisdiction_risk", contribution: 0.32 },
      { factor: "amount_anomaly", contribution: 0.28 },
      { factor: "supplier_tenure", contribution: 0.21 },
    ],
    outcome: "FLAGGED",
    timestamp: new Date(),
  },
  {
    transactionId: "E2E-TXN-002",
    amount: 89500,
    supplierName: "Huawei Technologies SA",
    country: "South Africa",
    transactionType: "PROCUREMENT",
    riskLevel: "LOW",
    riskScore: 15,
    confidence: 93,
    modelName: "Fraud Analyst — Carl",
    explanation: "Standard procurement from established technology supplier.",
    shapValues: [
      { factor: "supplier_tenure", contribution: -0.35 },
      { factor: "amount_anomaly", contribution: -0.22 },
    ],
    outcome: "PASSED",
    timestamp: new Date(),
  },
  {
    transactionId: "E2E-TXN-003",
    amount: 178000,
    supplierName: "Caspian Freight Solutions",
    country: "Kazakhstan",
    transactionType: "TRANSFER",
    riskLevel: "MEDIUM",
    riskScore: 52,
    confidence: 71,
    modelName: "Fraud Analyst — Carl",
    explanation: "Cross-border transfer with intermediary routing.",
    shapValues: [
      { factor: "routing_complexity", contribution: 0.25 },
      { factor: "jurisdiction_risk", contribution: 0.15 },
    ],
    outcome: "REVIEWING",
    timestamp: new Date(),
  },
];

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL || "http://localhost:3000";
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/merlynn";

  // 1. Seed the database
  await mongoose.connect(mongoUri);
  const Decision = mongoose.connection.collection("decisions");
  await Decision.deleteMany({ transactionId: /^E2E-/ });
  await Decision.insertMany(SEED_DECISIONS);
  await mongoose.disconnect();

  // 2. Log in and save auth state
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${baseURL}/login`);
  await page.fill('input[type="email"]', "admin@merlynn.co.za");
  await page.fill('input[type="password"]', "demo1234");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");
  await page.context().storageState({ path: "e2e/.auth/storage-state.json" });
  await browser.close();
}

export default globalSetup;
