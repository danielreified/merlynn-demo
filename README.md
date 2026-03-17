# Merlynn Risk Monitor

A financial risk decision monitoring dashboard built to demonstrate proficiency with the [Merlynn Intelligence Technologies](https://merlynn.co.za/) tech stack. The application simulates a real-world transaction risk assessment system, displaying risk scores, SHAP value explanations, and decision audit trails in a data-dense, Bloomberg-terminal-inspired dark UI.

**Demo credentials:** `admin@merlynn.co.za` / `demo1234`

---

## Prerequisites

| Dependency  | Version | Install                               |
| ----------- | ------- | ------------------------------------- |
| **Node.js** | >= 22   | [nodejs.org](https://nodejs.org/)     |
| **Bun**     | >= 1.3  | [bun.sh](https://bun.sh/)             |
| **Docker**  | Latest  | [docker.com](https://www.docker.com/) |

> Node.js and Bun are required for local development. Docker is required for MongoDB and running the test suites (e2e, visual regression).

---

## Live URLs

### Deployed (Dev Stack — AWS `af-south-1`)

| Service       | URL                                                                  |
| ------------- | -------------------------------------------------------------------- |
| Web App       | [app.daniellourie.me](https://app.daniellourie.me)                   |
| API Docs      | [app.daniellourie.me/api/docs](https://app.daniellourie.me/api/docs) |
| Storybook     | [storybook.daniellourie.me](https://storybook.daniellourie.me)       |
| Email Preview | [emails.daniellourie.me](https://emails.daniellourie.me)             |

### Local Development

| Service       | URL                                    | Command                            |
| ------------- | -------------------------------------- | ---------------------------------- |
| Web App       | http://localhost:3000                  | `bun run dev`                      |
| API Docs      | http://localhost:3000/api/docs         | (served by web app)                |
| OpenAPI Spec  | http://localhost:3000/api/openapi.json | (served by web app)                |
| Storybook     | http://localhost:6006                  | `bun run storybook`                |
| Email Preview | http://localhost:3333                  | `cd packages/email && bun run dev` |
| MongoDB       | mongodb://localhost:27017              | `bun run docker:up`                |
| Mongo Express | http://localhost:8081                  | (included with docker:up)          |

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Live URLs](#live-urls)
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
- [Pipeline](#pipeline)
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
| **Playwright 1.58**              | End-to-end testing of critical user flows (Dockerized)                 |
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
│       └── e2e/                      # Playwright E2E tests & global setup
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

### Installation

```bash
# Clone the repository
git clone https://github.com/daniellourie/merlynn-demo.git
cd merlynn-demo

# Install dependencies
bun install
```

### Local Development

```bash
# Start MongoDB via Docker
bun run docker:up

# Start the dev server
bun run dev
```

The app will be available at `http://localhost:3000`. On first login, 25 realistic financial transactions and a default admin user are auto-seeded into the database.

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
| `bun run test:e2e`     | Run Playwright E2E tests (Docker)            |
| `bun run docker:up`    | Start docker-compose services                |
| `bun run docker:down`  | Stop docker-compose services                 |
| `bun run docker:build` | Build and start all Docker services          |

### apps/web

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `bun run dev`      | Next.js dev server (port 3000) |
| `bun run build`    | Production build               |
| `bun run start`    | Start production server        |
| `bun run test:e2e` | Run Playwright E2E tests       |

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

All tests run inside Docker containers for environment consistency — no need to install browsers or databases locally. Docker Compose profiles isolate each test suite so they don't interfere with each other.

### Unit Tests

```bash
bun run test
```

Jest tests in `packages/db/__tests__/` use [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server) for isolated, deterministic testing without any external database dependency.

### End-to-End Tests

```bash
# Run all e2e tests (Docker)
docker compose --profile e2e run --rm e2e

# Rebuild and run (after code changes)
docker compose --profile e2e run --rm --build e2e

# Stop containers when done
docker compose --profile e2e down
```

Playwright specs in `apps/web/e2e/` test critical user flows against the full application stack.

**How it works:**

```
docker compose --profile e2e
├── mongo        MongoDB 7 (fresh database)
├── web          Next.js app (production build)
└── e2e          Playwright test runner
                 ├── globalSetup    1. Seeds MongoDB with test decisions
                 │                  2. Logs in via the UI
                 │                  3. Saves auth cookies to storageState
                 └── test specs     Run authenticated against the live app
```

1. **Database seeding** — A Playwright `globalSetup` script connects directly to MongoDB and inserts a fixed set of test decisions (prefixed `E2E-TXN-*`). This ensures deterministic data regardless of environment state.
2. **Authentication** — The same global setup logs in with the seeded demo credentials (`admin@merlynn.co.za` / `demo1234`) and saves the session cookie to `e2e/.auth/storage-state.json`. All tests reuse this auth state — no login step needed per test.
3. **Results** — Test reports and failure screenshots are mounted back to the host:
   - `apps/web/playwright-report/` — HTML report (open `index.html` in a browser)
   - `apps/web/test-results/` — Failure screenshots and traces

**Test coverage:**

| Test            | What it verifies                                                        |
| --------------- | ----------------------------------------------------------------------- |
| Stat cards      | Dashboard renders KPI cards (Total Today, High Risk Flagged, etc.)      |
| Decisions table | Recent Decisions table is visible and populated                         |
| Decision detail | Clicking a row navigates to detail page with Risk Score and SHAP values |
| Navigation      | "Back to Decisions" link returns to the decisions list                  |

### Visual Regression Tests

```bash
# Run visual tests (Docker)
docker compose --profile visual run --rm visual-test

# Update snapshots after intentional UI changes
docker compose --profile visual run --rm visual-test bun run test:visual:update

# Stop containers when done
docker compose --profile visual down
```

Vitest + Playwright-based visual regression testing for Storybook components.

**How it works:**

```
docker compose --profile visual
├── storybook      Storybook dev server (port 6006, with healthcheck)
└── visual-test    Vitest Browser Mode + Playwright
                   ├── Opens each story in a headless browser
                   ├── Takes a base64 screenshot
                   └── Compares against stored snapshots (.snap file)
```

1. **Storybook** runs as a separate container. The `visual-test` container waits for its healthcheck to pass before starting.
2. **Screenshots** are taken via a custom Vitest browser command that opens a new Playwright page for each story, waits for rendering + play functions to settle, and captures a base64 PNG.
3. **Snapshots** are stored in `packages/ui/stories/__screenshots__/__snapshots__/` and mounted back to the host so updates persist.
4. On subsequent runs, Vitest diffs the new screenshot against the stored snapshot. Any pixel difference causes the test to fail — run with `test:visual:update` to accept the new baseline.

**Components tested:**

Badge (High/Medium/Low), Button (Default/Destructive/Outline/Disabled), Card (Stat/HighRisk), Dialog, Select

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

## Pipeline

The full pipeline from local development to production, covering every gate and automation step.

### Overview

```
Local Dev ──▶ Pre-commit Hooks ──▶ Push ──▶ CI / Deploy ──▶ Production
    │              │                          │                  │
    │         Lint-staged              PR → ci.yml          release.yml
    │         CommitLint          develop → deploy.yml     (Release Please)
    │                                   │
    │                          ┌────────┼────────┐
    │                          ▼        ▼        ▼
    │                        ECS    Storybook  Emails
    │                       (app)    (S3+CF)  (S3+CF)
    ▼
 localhost:3000
```

### Stage 1: Local Development

When you run `bun run dev`, Turborepo starts all workspace dev servers in parallel. The Next.js app at `:3000` consumes `@merlynn/db` and `@merlynn/ui` as workspace dependencies — changes to those packages are picked up immediately via TypeScript path resolution (no build step needed in dev).

Docker Compose provides local services:

```bash
bun run docker:up   # Starts MongoDB (:27017) + Mongo Express (:8081)
bun run dev         # Starts Next.js (:3000)
```

On first load, `ensureSeeded()` checks if the database is empty and inserts 25 sample transactions + a default admin user.

### Stage 2: Pre-commit Hooks

Every `git commit` triggers two Husky hooks before the commit is created:

**1. `pre-commit` → lint-staged**

Runs only on staged files (not the whole codebase):

| File pattern           | Actions                             |
| ---------------------- | ----------------------------------- |
| `*.{ts,tsx}`           | `eslint --fix` → `prettier --write` |
| `*.{json,md,yml,yaml}` | `prettier --write`                  |

If ESLint finds unfixable errors, the commit is blocked.

**2. `commit-msg` → commitlint**

Validates the commit message against [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

# Valid types: feat, fix, docs, style, refactor, test, chore, ci, perf, build
# Examples:
#   feat: add CSV export to decisions page
#   fix(api): handle invalid ObjectId in decisions endpoint
#   docs: update README with pipeline details
```

If the message doesn't match the format, the commit is rejected.

### Stage 3: Pull Request CI (`ci.yml`)

Triggered on pull requests to `develop` or `main`. Runs 5 parallel jobs with a dependency gate:

```
┌──────────┐  ┌────────────┐  ┌───────────┐  ┌──────────────────┐
│   Lint   │  │ Typecheck  │  │ Test — DB │  │ Security Audit   │
│ & Format │  │            │  │           │  │ (npm audit, soft) │
└────┬─────┘  └─────┬──────┘  └─────┬─────┘  └──────────────────┘
     │              │               │
     │    must all pass             │
     └──────────┬───┘───────────────┘
                ▼
          ┌───────────┐
          │   Build   │
          │ (full app)│
          └───────────┘
```

| Job               | What it does                                                                            |
| ----------------- | --------------------------------------------------------------------------------------- |
| **Lint & Format** | `bun run lint` + `bun run format:check` (Prettier in check mode)                        |
| **Typecheck**     | `bun run typecheck` (TypeScript `--noEmit` across all packages)                         |
| **Test — DB**     | `bun test --cwd packages/db` (Jest + MongoDB Memory Server)                             |
| **Security**      | `npm audit --audit-level=high` (advisory, doesn't block)                                |
| **Build**         | `bun run build` — full Next.js production build (only if lint + typecheck + tests pass) |

All jobs use Turborepo remote caching (`rharkor/caching-for-turbo`) so unchanged packages skip re-running.

### Stage 4: Deploy to Dev (`deploy.yml`)

Triggered on every push to `develop` (i.e., when a PR is merged). Runs CI checks again, then deploys three things in parallel:

#### 4a. Web App → ECS Fargate

```
CI passes ──▶ Docker build ──▶ Push to ECR ──▶ ECS force-new-deployment ──▶ Wait for stable
                  │
                  ├── tag: dev-{short-sha}
                  └── tag: dev-latest
```

1. **Docker build** — Multi-stage `Dockerfile` produces a Node 22 Alpine image
2. **Push to ECR** — Tagged with `dev-{7-char-sha}` and `dev-latest`
3. **ECS update** — `aws ecs update-service --force-new-deployment` pulls the new image
4. **Wait** — `aws ecs wait services-stable` blocks until the new task is healthy (health check at `/api/health`)
5. **Live at** → `https://app.daniellourie.me`

#### 4b. Storybook → S3 + CloudFront

```
CI passes ──▶ Build Storybook ──▶ Sync to S3 ──▶ CloudFront invalidation
```

1. `cd packages/ui && bun run build-storybook` → static HTML/JS
2. `aws s3 sync` to the Storybook bucket (with `--delete` to remove stale files)
3. `aws cloudfront create-invalidation --paths "/*"` to bust the CDN cache
4. **Live at** → `https://storybook.daniellourie.me`

#### 4c. Email Previews → S3 + CloudFront

```
CI passes ──▶ Build emails ──▶ Export HTML ──▶ Sync to S3 ──▶ CloudFront invalidation
```

1. `bun run build` compiles TypeScript
2. `bunx react-email export` renders templates to static HTML
3. Same S3 sync + CloudFront invalidation pattern
4. **Live at** → `https://emails.daniellourie.me`

### Stage 5: Production Release (`release.yml`)

Triggered on push to `main`. Uses [Release Please](https://github.com/googleapis/release-please) for automated semantic versioning:

```
Push to main ──▶ Release Please ──▶ Creates/updates release PR
                                          │
                                    (when PR merges)
                                          │
                                          ▼
                                   Publish release image
                                          │
                                    ├── tag: v{version}
                                    └── tag: latest
```

1. **Release Please** analyzes conventional commit messages since the last release
2. Creates a release PR with a changelog and version bump
3. When that PR merges, the `publish` job runs:
   - Builds the Docker image
   - Tags with the version (`v1.2.3`) and `latest`
   - Pushes both tags to ECR (production environment)

### Stage 6: Production Deployment (Planned)

Once the Release Please PR merges and the versioned image (`v1.2.3`) is pushed to ECR, the production deployment would follow the same build pipeline as dev but with a blue/green release strategy to eliminate downtime and allow safe rollbacks.

#### Blue/Green via ECS + CodeDeploy

Rather than the `force-new-deployment` used in dev, production would use AWS CodeDeploy with ECS blue/green deployments:

1. **Green task set launches** — ECS spins up a new set of Fargate tasks running the release image alongside the existing ("blue") tasks
2. **Test traffic** — The ALB routes test listener traffic to the green target group. Health checks on `/api/health` must pass before any production traffic is shifted
3. **Canary traffic shift** — Production traffic shifts gradually using a `CodeDeployDefault.ECSCanary10Percent5Minutes` configuration: 10% of traffic moves to green, holds for 5 minutes, then shifts the remaining 90%
4. **Blue tear-down** — Once green is fully live and stable, the original blue tasks are terminated

#### Monitoring & Auto-Rollback

During the 5-minute canary window, CloudWatch alarms would monitor:

- **5xx error rate** on the ALB target group
- **p99 response latency** exceeding baseline thresholds
- **ECS task health** — unhealthy task count > 0

If any alarm enters `ALARM` state during the shift, CodeDeploy automatically rolls back to blue — re-routing all traffic to the original task set with zero manual intervention. A rollback can also be triggered manually via `aws deploy stop-deployment`.

#### Static Assets

Storybook and email previews would follow the same S3 sync + CloudFront invalidation pattern as dev, targeting the production buckets (`prod-afs1-merlynn-storybook`, `prod-afs1-merlynn-emails`) and distributions. Since these are static files with no running processes, a simple `--delete` sync is sufficient — no blue/green needed.

#### Terraform Changes

The production ECS service would add an `aws_codedeploy_app` and `aws_codedeploy_deployment_group` resource with blue/green configuration, replacing the simple rolling update used in dev. The ALB would gain a second (test) listener on port 8443 for pre-shift validation.

### Pipeline Summary

| Trigger                   | Workflow      | What happens                                                          |
| ------------------------- | ------------- | --------------------------------------------------------------------- |
| `git commit`              | Husky hooks   | lint-staged (ESLint + Prettier) + commitlint                          |
| PR to `develop` or `main` | `ci.yml`      | Lint, typecheck, test, security audit, build                          |
| Push to `develop`         | `deploy.yml`  | CI + deploy app (ECS), Storybook (S3), emails (S3)                    |
| Push to `main`            | `release.yml` | Release Please → version tag → production Docker image to ECR         |
| Release image published   | (planned)     | CodeDeploy blue/green → canary traffic shift → auto-rollback on alarm |

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

| JD Requirement      | Implementation                                                         |
| ------------------- | ---------------------------------------------------------------------- |
| React / Next.js     | Next.js 15 with App Router, Server + Client Components                 |
| TypeScript          | Strict mode across all packages, no `any` types                        |
| MongoDB             | Mongoose ODM with connection pooling, indexed queries                  |
| Component Libraries | Radix UI primitives with custom Tailwind styling                       |
| State Management    | TanStack React Query for server state, React hooks for local state     |
| Testing             | Jest + MongoDB Memory Server (unit), Playwright (e2e), Vitest (visual) |
| Monorepo            | Turborepo with Bun workspaces                                          |
| CI/CD               | GitHub Actions: lint, typecheck, test, build, deploy                   |
| Data Visualization  | SHAP value bar charts, risk score indicators, confidence gauges        |
| Infrastructure      | Terraform (AWS), Docker multi-stage builds, ECS Fargate                |

---

## License

Private — built as a technical demonstration for Merlynn Intelligence Technologies.
