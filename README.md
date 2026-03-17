# Merlynn Risk Monitor

A financial risk decision monitoring dashboard built to demonstrate proficiency with the [Merlynn Intelligence Technologies](https://merlynn.co.za/) tech stack. The application simulates a real-world transaction risk assessment system, displaying risk scores, SHAP value explanations, and decision audit trails in a data-dense, Bloomberg-terminal-inspired dark UI.

**Demo credentials:** `admin@merlynn.co.za` / `demo1234`

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Database Models](#database-models)
- [Testing](#testing)
- [Deployment](#deployment)
- [CI/CD](#cicd)
- [Architecture Decisions](#architecture-decisions)
- [Stack Alignment](#stack-alignment)

---

## Tech Stack

| Technology                       | Purpose                                                                |
| -------------------------------- | ---------------------------------------------------------------------- |
| **Next.js 15** (App Router)      | Full-stack React framework with Server Components for direct DB access |
| **React 19**                     | UI rendering with Server and Client Components                         |
| **TypeScript 5.7** (strict mode) | Type safety across the entire monorepo                                 |
| **Bun 1.3**                      | Package manager and JavaScript runtime                                 |
| **Turborepo 2.3**                | Monorepo build orchestration with task caching                         |
| **MongoDB + Mongoose 8**         | Document database with typed ODM, connection pooling                   |
| **Hono 4**                       | Lightweight, typed REST API framework                                  |
| **NextAuth 5** (beta)            | JWT-based authentication with credentials provider                     |
| **Radix UI**                     | Accessible, unstyled primitive components (Dialog, Select)             |
| **Tailwind CSS 3.4**             | Utility-first styling for the dark fintech aesthetic                   |
| **TanStack React Query 5**       | Server state management with caching, invalidation                     |
| **Zod 4**                        | Runtime schema validation for API inputs                               |
| **@xyflow/react**                | Interactive node/edge graph visualization for model editor             |
| **PapaParse**                    | Client-side CSV export generation                                      |
| **Jest + MongoDB Memory Server** | Isolated database testing without external dependencies                |
| **Cypress 13**                   | End-to-end testing of critical user flows                              |
| **Vitest + Playwright**          | Visual regression testing for UI components                            |
| **Storybook 10**                 | Component development and visual documentation                         |
| **Scalar**                       | Auto-generated interactive OpenAPI documentation                       |
| **Docker**                       | Multi-stage container builds for production                            |
| **Terraform**                    | Infrastructure as Code for AWS deployment                              |
| **GitHub Actions**               | CI/CD pipeline: lint, typecheck, test, build, deploy                   |

---

## Monorepo Structure

```
merlynn-demo/
├── apps/
│   └── web/                          # Next.js 15 application
│       ├── app/                      # App Router pages & API routes
│       │   ├── api/                  # Hono API (decisions, models, health)
│       │   ├── dashboard/            # Dashboard page (Server Component)
│       │   ├── decisions/            # Decisions list & detail pages
│       │   ├── models/               # Model management & visual editor
│       │   ├── settings/             # API key management
│       │   └── login/                # Authentication page
│       ├── components/               # Client & Server React components
│       │   ├── dashboard/            # KPI cards, risk chart, recent table
│       │   ├── decisions/            # SHAP chart, feedback panel, filters
│       │   └── models/               # Model canvas, node editor
│       ├── lib/                      # Shared utilities
│       │   ├── auth.ts               # NextAuth configuration
│       │   ├── db.ts                 # Database queries & helpers
│       │   ├── risk.ts               # Risk assessment simulation engine
│       │   ├── seed.ts               # 25 sample financial transactions
│       │   └── api/                  # Hono routers & auth middleware
│       └── cypress/                  # E2E test specs & fixtures
├── packages/
│   ├── db/                           # @merlynn/db — Mongoose models
│   │   ├── src/
│   │   │   ├── connection.ts         # Connection pooling & caching
│   │   │   └── models/               # Decision, User, Model, ApiKey
│   │   └── __tests__/                # Jest tests (MongoDB Memory Server)
│   ├── ui/                           # @merlynn/ui — Component library
│   │   ├── src/                      # Badge, Button, Card, Dialog, Select
│   │   └── stories/                  # Storybook stories & visual snapshots
│   └── email/                        # @merlynn/email — React Email templates
│       └── src/templates/            # Email component templates
├── terraform/                        # AWS infrastructure
│   ├── modules/                      # Reusable modules (VPC, ALB, ECS, etc.)
│   └── stacks/                       # Environment stacks (dev, prod)
├── .github/workflows/                # CI/CD pipelines
├── Dockerfile                        # Multi-stage production build
├── docker-compose.yml                # Local development services
├── turbo.json                        # Turborepo task configuration
└── tsconfig.base.json                # Shared TypeScript config
```

### Package Dependencies

```
apps/web ──depends on──▶ @merlynn/db
         ──depends on──▶ @merlynn/ui
```

---

## Features

### Dashboard (`/dashboard`)

Server-rendered page with direct MongoDB queries. Displays:

- **KPI cards** — Transactions today, high-risk count, accuracy rate, average confidence
- **Risk distribution chart** — Pie chart showing HIGH / MEDIUM / LOW breakdown
- **Recent decisions table** — Last 7 days of transactions
- **Active models sidebar** — Currently deployed decision models

### Decisions Log (`/decisions`)

Client-rendered with React Query for real-time filtering and caching:

- Paginated table (20 per page, max 100 pages)
- Filter by risk level, supplier name, transaction ID, model name, and date range
- CSV and JSON export of filtered results
- Feedback indicators (CORRECT / PARTIAL / INCORRECT)
- Click-through to decision detail

### Decision Detail (`/decisions/[id]`)

- Full transaction metadata
- **SHAP value bar chart** — Factor contributions to the risk score
- Decision explanation text
- Confidence gauge visualization
- Feedback submission panel (rating + optional note)
- "Ask Tom" AI panel (placeholder)
- Previous / next decision navigation

### Models Management (`/models`)

- Model cards grid with status badges (draft / training / deployed)
- Create new models with interactive visual editor
- **Canvas editor** (`/models/[id]/edit`) — Drag-and-drop node/edge graph using @xyflow/react
- Node types: factor, decision, output
- Full CRUD operations via API

### Settings (`/settings`)

- **API key management** — Generate, view, and revoke API keys
- Stripe-style key format: `mk_live_` + 48 hex characters
- Keys are SHA-256 hashed before storage (one-way, non-retrievable)
- Last-used timestamp tracking

### Authentication

- Email/password login with NextAuth 5
- JWT session strategy
- Role-based access (ANALYST / ADMIN)
- Default user auto-seeded on first run
- Dual auth support: session cookies (browser) + Bearer API keys (programmatic)

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.3
- [MongoDB](https://www.mongodb.com/) running locally (or a connection string to Atlas)
- [Docker](https://www.docker.com/) (optional, for containerized development)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/merlynn-demo.git
cd merlynn-demo

# Install dependencies
bun install
```

### Local Development

```bash
# Option 1: Start with local MongoDB
bun run dev

# Option 2: Start with Docker (includes MongoDB)
bun run docker:up
bun run dev
```

The app will be available at `http://localhost:3000`. On first load, 25 realistic financial transactions are auto-seeded into the database.

---

## Environment Variables

Create a `.env.local` file in `apps/web/`:

```bash
# Required
MONGODB_URI=mongodb://localhost:27017/merlynn    # Local MongoDB connection
AUTH_SECRET=your-random-secret-here               # NextAuth JWT signing key (32+ bytes)
AUTH_URL=http://localhost:3000                     # NextAuth callback URL

# Optional (production)
MONGODB_URI_ATLAS=mongodb+srv://...               # MongoDB Atlas connection string
```

In production (ECS), `MONGODB_URI` and `AUTH_SECRET` are injected from AWS Secrets Manager.

---

## Available Scripts

### Root (monorepo)

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `bun run dev`          | Start all dev servers via Turborepo          |
| `bun run build`        | Build all packages and apps                  |
| `bun run lint`         | Run ESLint across all packages               |
| `bun run format`       | Format all code with Prettier                |
| `bun run format:check` | Check formatting without writing             |
| `bun run typecheck`    | TypeScript type checking across all packages |
| `bun run test`         | Run all test suites                          |
| `bun run storybook`    | Start Storybook dev server                   |
| `bun run test:visual`  | Run visual regression tests (Docker)         |
| `bun run test:e2e`     | Run Cypress tests headless                   |
| `bun run docker:up`    | Start docker-compose services                |
| `bun run docker:down`  | Stop docker-compose services                 |
| `bun run docker:build` | Build and start all Docker services          |

### apps/web

| Command                    | Description                    |
| -------------------------- | ------------------------------ |
| `bun run dev`              | Next.js dev server (port 3000) |
| `bun run build`            | Production build               |
| `bun run start`            | Start production server        |
| `bun run cypress`          | Open Cypress UI                |
| `bun run cypress:headless` | Run Cypress headless           |

### packages/ui

| Command                      | Description                      |
| ---------------------------- | -------------------------------- |
| `bun run storybook`          | Storybook dev server (port 6006) |
| `bun run build-storybook`    | Build static Storybook           |
| `bun run test:visual`        | Visual regression tests          |
| `bun run test:visual:update` | Update visual snapshots          |

### packages/email

| Command       | Description                        |
| ------------- | ---------------------------------- |
| `bun run dev` | React Email dev server (port 3333) |

---

## API Reference

All API routes are served under `/api` and built with Hono. Interactive documentation is available at `/api/docs` (Scalar UI), and the OpenAPI 3.1.0 spec is at `/api/openapi.json`.

### Public Endpoints

| Method | Path                | Description                      |
| ------ | ------------------- | -------------------------------- |
| GET    | `/api/health`       | Health check (`{ status: "ok"}`) |
| GET    | `/api/openapi.json` | OpenAPI specification            |
| GET    | `/api/docs`         | Interactive API documentation    |

### Decisions (authenticated)

| Method | Path                    | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| GET    | `/api/decisions`        | List decisions (paginated, filtered) |
| GET    | `/api/decisions/export` | Export as CSV or JSON                |
| GET    | `/api/decisions/:id`    | Get a single decision                |
| POST   | `/api/decisions`        | Create a new decision                |

#### Query Parameters

| Parameter   | Type   | Default | Description                            |
| ----------- | ------ | ------- | -------------------------------------- |
| `page`      | number | 1       | Page number (max 100)                  |
| `limit`     | number | 20      | Items per page (max 100)               |
| `riskLevel` | string | —       | Filter: `HIGH`, `MEDIUM`, or `LOW`     |
| `search`    | string | —       | Search supplier name or transaction ID |
| `modelName` | string | —       | Filter by model name                   |
| `dateFrom`  | string | —       | ISO date lower bound                   |
| `dateTo`    | string | —       | ISO date upper bound                   |
| `format`    | string | json    | Export format: `csv` or `json`         |

### Models (authenticated)

| Method | Path              | Description        |
| ------ | ----------------- | ------------------ |
| GET    | `/api/models`     | List all models    |
| GET    | `/api/models/:id` | Get a single model |
| POST   | `/api/models`     | Create a model     |
| PUT    | `/api/models/:id` | Update a model     |
| DELETE | `/api/models/:id` | Delete a model     |

---

## Authentication

The API supports two authentication methods:

### 1. Session Cookie (Browser)

NextAuth JWT session via the `next-auth.session-token` cookie. Used automatically by the browser after login.

### 2. API Key (Programmatic)

```bash
curl -H "Authorization: Bearer mk_live_abc123..." https://app.example.com/api/decisions
```

API keys are:

- Generated with prefix `mk_live_` + 48 random hex characters
- Stored as SHA-256 hashes (non-retrievable after creation)
- Cached in-memory for 5 minutes to reduce database lookups
- Tracked with `lastUsedAt` timestamps
- Permanently revocable (one-way operation)

### Auth Flow

1. User submits credentials on `/login`
2. NextAuth `authorize()` looks up user by email (case-insensitive)
3. Password verified with `bcryptjs.compare()`
4. JWT token issued with `{ id, email, name, role }`
5. Session available via `auth()` server-side or `useSession()` client-side

---

## Database Models

The application uses MongoDB with Mongoose. Four collections:

### Decision

| Field             | Type                                                              | Notes                           |
| ----------------- | ----------------------------------------------------------------- | ------------------------------- |
| `transactionId`   | string                                                            | Unique, indexed                 |
| `amount`          | number                                                            |                                 |
| `supplierName`    | string                                                            | Trimmed                         |
| `country`         | string                                                            |                                 |
| `transactionType` | `PAYMENT` \| `INVOICE` \| `TRANSFER` \| `REFUND` \| `PROCUREMENT` |                                 |
| `riskLevel`       | `HIGH` \| `MEDIUM` \| `LOW`                                       |                                 |
| `riskScore`       | number                                                            | 0–100                           |
| `confidence`      | number                                                            | 0–100, default 75               |
| `modelName`       | string                                                            | Default: "Fraud Analyst — Carl" |
| `explanation`     | string                                                            |                                 |
| `shapValues`      | `{ factor: string, contribution: number }[]`                      | SHAP explanations               |
| `outcome`         | `FLAGGED` \| `PASSED` \| `REVIEWING`                              |                                 |
| `feedback`        | `{ rating, note?, submittedBy, submittedAt }`                     | Optional                        |
| `timestamp`       | Date                                                              | Indexed                         |

### User

| Field          | Type                 | Notes             |
| -------------- | -------------------- | ----------------- |
| `email`        | string               | Unique, lowercase |
| `name`         | string               |                   |
| `passwordHash` | string               | bcryptjs          |
| `role`         | `ANALYST` \| `ADMIN` | Default: ANALYST  |

### DecisionModel

| Field         | Type                                | Notes              |
| ------------- | ----------------------------------- | ------------------ |
| `name`        | string                              |                    |
| `description` | string                              | Optional           |
| `status`      | `draft` \| `training` \| `deployed` |                    |
| `nodes`       | `IModelNode[]`                      | Visual graph nodes |
| `edges`       | `IModelEdge[]`                      | Node connections   |
| `createdBy`   | string                              | User ID            |

### ApiKey

| Field        | Type    | Notes                      |
| ------------ | ------- | -------------------------- |
| `name`       | string  |                            |
| `keyHash`    | string  | SHA-256, indexed           |
| `prefix`     | string  | First 16 chars for display |
| `createdBy`  | string  | User ID, indexed           |
| `lastUsedAt` | Date    | Optional                   |
| `revoked`    | boolean | Default: false             |

---

## Testing

### Unit Tests

```bash
bun run test
```

Jest tests in `packages/db/__tests__/` use [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server) for isolated, deterministic testing without any external database dependency.

### End-to-End Tests

```bash
# Interactive
bun run cypress

# Headless (CI)
bun run test:e2e
```

Cypress specs in `apps/web/cypress/` test critical user flows.

### Visual Regression Tests

```bash
# Run tests (requires Docker)
bun run test:visual

# Update snapshots
bun run test:visual:update
```

Vitest + Playwright-based visual regression testing for Storybook components. Screenshots stored in `packages/ui/stories/__screenshots__/`.

### Pre-commit Hooks

- **Husky** runs lint-staged on commit (Prettier formatting)
- **CommitLint** enforces [Conventional Commits](https://www.conventionalcommits.org/) format

---

## Deployment

### Architecture Overview

```
                    ┌─────────────┐
                    │  Route 53   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         ┌────────┐  ┌──────────┐  ┌──────────┐
         │  ALB   │  │CloudFront│  │CloudFront│
         │(HTTPS) │  │Storybook │  │  Emails  │
         └───┬────┘  └────┬─────┘  └────┬─────┘
             │            │              │
             ▼            ▼              ▼
        ┌─────────┐  ┌─────────┐   ┌─────────┐
        │   ECS   │  │   S3    │   │   S3    │
        │ Fargate │  │ Bucket  │   │ Bucket  │
        └────┬────┘  └─────────┘   └─────────┘
             │
             ▼
      ┌──────────────┐
      │MongoDB Atlas │
      └──────────────┘
```

### AWS Resources (Terraform)

The infrastructure is defined in `terraform/` with reusable modules:

| Module              | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `vpc`               | VPC with public/private subnets across 2 AZs |
| `alb`               | Application Load Balancer with HTTPS         |
| `ecs_cluster`       | ECS Fargate cluster                          |
| `ecs_service`       | ECS service and task definition              |
| `ecr`               | Container registry for Docker images         |
| `cloudwatch_log`    | Log group with configurable retention        |
| `cloudfront_s3_oac` | CloudFront distribution with S3 OAC          |
| `s3`                | S3 buckets for static assets                 |
| `acm_certs`         | SSL/TLS certificates                         |

### Environment Configurations

| Setting               | Dev            | Prod           |
| --------------------- | -------------- | -------------- |
| VPC CIDR              | `10.10.0.0/16` | `10.20.0.0/16` |
| AWS Region            | `af-south-1`   | `af-south-1`   |
| ECS CPU / Memory      | 256 / 512 MB   | 512 / 1024 MB  |
| Log Retention         | 7 days         | 30 days        |
| Container Insights    | Disabled       | Enabled        |
| ALB Delete Protection | Disabled       | Enabled        |

### Docker

The multi-stage `Dockerfile` produces a minimal production image:

1. **deps** — Install dependencies with frozen lockfile
2. **builder** — Build the Next.js application
3. **runner** — Node 22 Alpine, runs as `nextjs` user, health check on `/api/health`

```bash
# Build and run locally
docker build -t merlynn-demo .
docker run -p 3000:3000 --env-file apps/web/.env.local merlynn-demo
```

---

## CI/CD

### Pull Request (`ci.yml`)

Runs on every pull request:

1. Lint + Prettier format check
2. TypeScript typecheck
3. Jest tests (with MongoDB Memory Server)
4. Security audit (`npm audit`)
5. Full build (requires all above to pass)

### Deploy to Dev (`deploy.yml`)

Triggered on push to `develop`:

1. All CI checks
2. Docker build → push to ECR (tagged `dev-{sha}` and `dev-latest`)
3. ECS force-new-deployment → wait for stable
4. Storybook build → deploy to S3 → CloudFront invalidation
5. Email previews → deploy to S3 → CloudFront invalidation

### Production Release (`release.yml`)

Triggered manually or on version tag for production deployment.

---

## Architecture Decisions

| Decision                             | Rationale                                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Server Components for Dashboard**  | Fetches directly from MongoDB — zero client-side data loading overhead, instant page render                              |
| **React Query for Decisions**        | Complex filtering, pagination, and cache invalidation require client-side state management                               |
| **Hono over Next.js Route Handlers** | Typed routing, middleware composition, and OpenAPI generation in a lightweight framework                                 |
| **Dual authentication**              | Session cookies for browser UX, API keys for programmatic access and integrations                                        |
| **SHAP value simulation**            | Demonstrates ML explainability patterns (jurisdiction analysis, amount anomaly detection) without requiring a real model |
| **Monorepo with shared packages**    | `@merlynn/db` and `@merlynn/ui` enable code reuse across potential future applications                                   |
| **MongoDB Memory Server for tests**  | Fast, deterministic, no external database dependency — tests are fully self-contained                                    |
| **Bloomberg-terminal dark UI**       | Matches the data-dense, professional aesthetic expected in fintech risk monitoring                                       |

---

## Stack Alignment

Mapping each technology to the Merlynn Intelligence Technologies JD requirements:

| JD Requirement      | Implementation                                                      |
| ------------------- | ------------------------------------------------------------------- |
| React / Next.js     | Next.js 15 with App Router, Server + Client Components              |
| TypeScript          | Strict mode across all packages, no `any` types                     |
| MongoDB             | Mongoose ODM with connection pooling, indexed queries               |
| Component Libraries | Radix UI primitives with custom Tailwind styling                    |
| State Management    | TanStack React Query for server state, React hooks for local state  |
| Testing             | Jest + MongoDB Memory Server (unit), Cypress (e2e), Vitest (visual) |
| Monorepo            | Turborepo with Bun workspaces                                       |
| CI/CD               | GitHub Actions: lint, typecheck, test, build, deploy                |
| Data Visualization  | SHAP value bar charts, risk score indicators, confidence gauges     |
| Infrastructure      | Terraform (AWS), Docker multi-stage builds, ECS Fargate             |

---

## License

Private — built as a technical demonstration for Merlynn Intelligence Technologies.
