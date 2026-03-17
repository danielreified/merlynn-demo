# @merlynn/email

React Email templates for the Merlynn Risk Monitor platform. Provides production-ready, email-client-compatible HTML templates for risk alerts and weekly digest reports.

---

## Installation

This package is part of the monorepo and is consumed via workspace resolution:

```ts
import { RiskAlert, WeeklyDigest } from "@merlynn/email";
```

---

## Development

Preview templates in the browser with React Email's dev server:

```bash
bun run dev
```

Opens at `http://localhost:3333` with hot-reload.

---

## Templates

### RiskAlert

Triggered when a high-value transaction is flagged for review. Displays a color-coded risk assessment with SHAP factor contributions.

```tsx
import { RiskAlert } from "@merlynn/email";

<RiskAlert
  transactionId="TXN-2026-0301"
  supplierName="Meridian Global Trading Ltd"
  amount={2450000}
  country="Nigeria"
  riskLevel="HIGH"
  riskScore={85}
  confidence={92}
  modelName="Fraud Analyst — Carl"
  explanation="Automated risk assessment for payment..."
  topFactors={[
    { factor: "Jurisdiction Risk", contribution: 0.35 },
    { factor: "Amount Anomaly", contribution: 0.28 },
    { factor: "Supplier Tenure", contribution: 0.15 },
  ]}
  decisionUrl="https://app.merlynn.co.za/decisions/abc123"
/>;
```

#### Props

| Prop            | Type                                         | Description                  |
| --------------- | -------------------------------------------- | ---------------------------- |
| `transactionId` | `string`                                     | Transaction reference ID     |
| `supplierName`  | `string`                                     | Vendor/supplier name         |
| `amount`        | `number`                                     | Transaction amount           |
| `country`       | `string`                                     | Origin country               |
| `riskLevel`     | `"HIGH"` \| `"MEDIUM"` \| `"LOW"`            | Risk classification          |
| `riskScore`     | `number`                                     | Risk score (0–100)           |
| `confidence`    | `number`                                     | Model confidence (0–100)     |
| `modelName`     | `string`                                     | Name of the assessing model  |
| `explanation`   | `string`                                     | Risk assessment narrative    |
| `topFactors`    | `{ factor: string, contribution: number }[]` | SHAP factor contributions    |
| `decisionUrl`   | `string`                                     | Link to decision detail page |

All props have sensible defaults for previewing.

#### Layout

1. Dark header — "Merlynn / Risk Monitor" branding
2. Color-coded alert banner — Red (HIGH), Orange (MEDIUM), Green (LOW)
3. Transaction details grid — ID, supplier, formatted amount, country, confidence
4. Risk assessment explanation
5. Contributing factors — Horizontal bars showing relative contribution percentages
6. "Review Decision" CTA button
7. Footer with disclaimer

### WeeklyDigest

Weekly summary email sent to analysts with aggregated risk monitoring metrics.

```tsx
import { WeeklyDigest } from "@merlynn/email";

<WeeklyDigest
  userName="Sarah Chen"
  weekOf="10 Mar – 16 Mar 2026"
  stats={{
    totalDecisions: 342,
    highRisk: 28,
    mediumRisk: 89,
    lowRisk: 225,
    flaggedRate: 8.2,
    avgConfidence: 87,
    accuracyRate: 94.1,
  }}
  topFlaggedSuppliers={[
    { name: "Meridian Global Trading", count: 5, country: "Nigeria" },
    { name: "Eastern Star Logistics", count: 3, country: "Myanmar" },
  ]}
  modelPerformance={[
    { name: "Fraud Analyst — Carl", decisions: 189, accuracy: 95.2 },
    { name: "AML Monitor — Lisa", decisions: 153, accuracy: 92.8 },
  ]}
  dashboardUrl="https://app.merlynn.co.za/dashboard"
/>;
```

#### Props

| Prop                   | Type                                                      | Description               |
| ---------------------- | --------------------------------------------------------- | ------------------------- |
| `userName`             | `string`                                                  | Recipient's name          |
| `weekOf`               | `string`                                                  | Date range string         |
| `stats`                | `object`                                                  | Aggregated weekly metrics |
| `stats.totalDecisions` | `number`                                                  | Total decisions processed |
| `stats.highRisk`       | `number`                                                  | High risk count           |
| `stats.mediumRisk`     | `number`                                                  | Medium risk count         |
| `stats.lowRisk`        | `number`                                                  | Low risk count            |
| `stats.flaggedRate`    | `number`                                                  | Flagged percentage        |
| `stats.avgConfidence`  | `number`                                                  | Average model confidence  |
| `stats.accuracyRate`   | `number`                                                  | Model accuracy percentage |
| `topFlaggedSuppliers`  | `{ name: string, count: number, country: string }[]`      | Most flagged vendors      |
| `modelPerformance`     | `{ name: string, decisions: number, accuracy: number }[]` | Per-model stats           |
| `dashboardUrl`         | `string`                                                  | Link to dashboard         |

#### Layout

1. Dark header — "Merlynn / Weekly Risk Digest" branding
2. Personalized greeting with date range
3. Key metrics cards — Total decisions, flagged rate, confidence, accuracy (4 columns)
4. Risk breakdown — Bullet list with colored dots + visual stacked bar chart
5. Top flagged suppliers — Ranked table with country and flag count
6. Model performance — Accuracy metrics per model
7. "View Dashboard" CTA button
8. Footer with send schedule (Monday 08:00 SAST)

---

## Technical Details

### Email Client Compatibility

All styling is done with **inline CSS** (no external stylesheets) for maximum email client compatibility. Both templates use:

- `@react-email/components` — `Html`, `Head`, `Body`, `Container`, `Section`, `Row`, `Column`, `Heading`, `Text`, `Link`, `Hr`, `Preview`
- Max width 600px container (email standard)
- System font stack: Segoe UI / SF Pro Display / sans-serif
- No CSS Grid or Flexbox — uses Row/Column for layout

### Color Scheme

Risk levels use consistent colors across both templates:

| Level  | Color  | Hex       |
| ------ | ------ | --------- |
| HIGH   | Red    | `#dc2626` |
| MEDIUM | Orange | `#ea580c` |
| LOW    | Green  | `#16a34a` |

---

## Scripts

| Command         | Description                        |
| --------------- | ---------------------------------- |
| `bun run dev`   | React Email dev server (port 3333) |
| `bun run build` | TypeScript compilation             |
