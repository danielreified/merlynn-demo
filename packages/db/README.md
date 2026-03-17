# @merlynn/db

Mongoose models and MongoDB connection utilities for the Merlynn Risk Monitor platform. This package provides typed database models, connection pooling optimized for serverless environments, and is consumed by the `apps/web` application.

---

## Installation

This package is part of the monorepo and is consumed via workspace resolution:

```ts
import { connectDB, Decision, User, ApiKey, DecisionModel } from "@merlynn/db";
```

---

## Connection Management

### `connectDB()`

Establishes a MongoDB connection with pooling and caching, designed for serverless/Fargate environments where multiple invocations may share a single process.

```ts
import { connectDB } from "@merlynn/db";

await connectDB();
```

- Uses a global cache (`mongooseCache`) to prevent connection leaks
- Checks connection state and handles stale connections
- **Pool settings**: `maxPoolSize: 10`, `minPoolSize: 2`
- **Timeouts**: `serverSelectionTimeoutMS: 10000`, `socketTimeoutMS: 45000`
- Connection string: `MONGODB_URI` env var (defaults to `mongodb://localhost:27017/merlynn`)

### `disconnectDB()`

Closes the connection and clears the cache. Used primarily in tests.

```ts
import { disconnectDB } from "@merlynn/db";

await disconnectDB();
```

---

## Models

### Decision

Represents a financial transaction that has been assessed for risk.

| Field             | Type                                                                        | Notes                             |
| ----------------- | --------------------------------------------------------------------------- | --------------------------------- |
| `transactionId`   | `string`                                                                    | Unique, indexed                   |
| `amount`          | `number`                                                                    | Min: 0                            |
| `supplierName`    | `string`                                                                    | Required, trimmed                 |
| `country`         | `string`                                                                    | Required                          |
| `transactionType` | `"PAYMENT"` \| `"INVOICE"` \| `"TRANSFER"` \| `"REFUND"` \| `"PROCUREMENT"` |                                   |
| `riskLevel`       | `"HIGH"` \| `"MEDIUM"` \| `"LOW"`                                           |                                   |
| `riskScore`       | `number`                                                                    | 0–100                             |
| `confidence`      | `number`                                                                    | 0–100, default: 75                |
| `modelName`       | `string`                                                                    | Default: `"Fraud Analyst — Carl"` |
| `explanation`     | `string`                                                                    | Required                          |
| `shapValues`      | `{ factor: string, contribution: number }[]`                                | SHAP explanations (no `_id`)      |
| `outcome`         | `"FLAGGED"` \| `"PASSED"` \| `"REVIEWING"`                                  |                                   |
| `feedback`        | `{ rating, note?, submittedBy, submittedAt }`                               | Optional subdocument              |
| `reviewedBy`      | `string`                                                                    | Optional                          |
| `timestamp`       | `Date`                                                                      | Indexed, default: `now`           |

**Indexes**: `transactionId` (unique), `timestamp`

```ts
import { Decision } from "@merlynn/db";

const decisions = await Decision.find({ riskLevel: "HIGH" })
  .sort({ timestamp: -1 })
  .limit(20)
  .lean();
```

### User

Authentication user with role-based access.

| Field          | Type                     | Notes                      |
| -------------- | ------------------------ | -------------------------- |
| `email`        | `string`                 | Unique, lowercase, trimmed |
| `name`         | `string`                 | Required, trimmed          |
| `passwordHash` | `string`                 | bcryptjs hash              |
| `role`         | `"ANALYST"` \| `"ADMIN"` | Default: `"ANALYST"`       |
| `createdAt`    | `Date`                   | Default: `now`             |

### ApiKey

API keys for programmatic access. Keys are stored as SHA-256 hashes.

| Field        | Type      | Notes                      |
| ------------ | --------- | -------------------------- |
| `name`       | `string`  | Required, trimmed          |
| `keyHash`    | `string`  | SHA-256 hash, indexed      |
| `prefix`     | `string`  | First 16 chars for display |
| `createdBy`  | `string`  | User ID, indexed           |
| `lastUsedAt` | `Date`    | Optional                   |
| `expiresAt`  | `Date`    | Optional                   |
| `revoked`    | `boolean` | Default: `false`           |

**Timestamps**: `createdAt`, `updatedAt` (auto-managed)

### DecisionModel

Visual decision model with a node/edge graph structure for the canvas editor.

| Field         | Type                                      | Notes              |
| ------------- | ----------------------------------------- | ------------------ |
| `name`        | `string`                                  | Required, trimmed  |
| `description` | `string`                                  | Optional           |
| `status`      | `"draft"` \| `"training"` \| `"deployed"` | Default: `"draft"` |
| `nodes`       | `IModelNode[]`                            | Graph nodes        |
| `edges`       | `IModelEdge[]`                            | Node connections   |
| `createdBy`   | `string`                                  | Required           |

**Timestamps**: `createdAt`, `updatedAt` (auto-managed)

#### IModelNode

```ts
{
  id: string;
  type: "factor" | "decision" | "output";
  label: string;
  position: { x: number; y: number };
  data: {
    description?: string;
    weight?: number;
    threshold?: number;
    riskLevel?: string;
    options?: string[];
  };
}
```

#### IModelEdge

```ts
{
  id: string;
  source: string;
  target: string;
  label?: string;
}
```

---

## Exported Types

```ts
import type {
  IDecision,
  IDecisionDocument,
  RiskLevel,
  Outcome,
  TransactionType,
  ShapValue,
  Feedback,
  FeedbackRating,
  IUser,
  IUserDocument,
  UserRole,
  IApiKey,
  IApiKeyDocument,
  IModel,
  IModelDocument,
  IModelNode,
  IModelEdge,
  ModelStatus,
  NodeType,
} from "@merlynn/db";
```

---

## Testing

Tests use [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server) for an in-memory database — no external MongoDB required.

```bash
bun test
```

Test file: `__tests__/decision.test.ts`

Tests cover:

- Creating a decision with all fields
- Reading decisions back from the database
- Validation constraints (riskLevel enum, outcome enum, riskScore range, amount min)
- Unique constraint on `transactionId`

---

## Design Patterns

- **Connection caching**: Global `mongooseCache` prevents connection leaks across serverless invocations
- **Model re-registration prevention**: `mongoose.models.X ?? mongoose.model()` avoids errors from hot module reloading
- **Embedded subdocuments**: SHAP values and feedback are embedded (no separate collections), with `_id: false`
- **Lean queries**: Consumers use `.lean()` for plain objects instead of Mongoose documents
- **Separate type interfaces**: `IDecision` (plain data) vs `IDecisionDocument` (Mongoose document with methods)
