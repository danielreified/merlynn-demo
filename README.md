# Merlynn Risk Monitor

A financial risk decision monitoring dashboard built to demonstrate proficiency with the [Merlynn Intelligence Technologies](https://merlynn.co.za/) tech stack. This application simulates a real-world transaction risk assessment system, displaying risk scores, SHAP value explanations, and decision audit trails in a data-dense, Bloomberg-terminal-inspired dark UI.

## Tech Stack

| Technology                       | Purpose                                                                |
| -------------------------------- | ---------------------------------------------------------------------- |
| **Next.js 15** (App Router)      | Full-stack React framework with Server Components for direct DB access |
| **TypeScript** (strict mode)     | Type safety across the entire monorepo                                 |
| **MongoDB + Mongoose**           | Document database for flexible decision/transaction storage            |
| **Radix UI**                     | Accessible, unstyled primitive components (Dialog, Select)             |
| **Tailwind CSS**                 | Utility-first styling for the dark fintech aesthetic                   |
| **TanStack React Query**         | Server state management with caching, invalidation                     |
| **Turborepo**                    | Monorepo build orchestration with task caching                         |
| **Jest + MongoDB Memory Server** | Isolated database testing without external dependencies                |
| **Cypress**                      | End-to-end testing of critical user flows                              |
| **Storybook**                    | Component development and visual documentation                         |
| **GitHub Actions**               | CI pipeline: lint, typecheck, test, build                              |

## Monorepo Structure

```
merlynn-demo/
├── apps/
│   └── web/                     # Next.js 15 application
│       ├── app/                 # App Router pages & API routes
│       ├── components/          # Client Components (React Query, forms)
│       ├── lib/                 # DB utilities, seed data
│       └── cypress/             # E2E tests
├── packages/
│   ├── ui/                      # Radix UI + Tailwind component library
│   │   ├── src/                 # Badge, Button, Card, Dialog, Select
│   │   └── stories/             # Storybook stories
│   └── db/                      # Mongoose models + connection utility
│       ├── src/                 # Decision model, connection pooling
│       └── __tests__/           # Jest tests with MongoDB Memory Server
├── turbo.json                   # Turborepo task configuration
└── .github/workflows/ci.yml    # CI pipeline
```

## Setup

```bash
# Install dependencies
bun install

# Start development server (requires MongoDB running locally)
bun run dev

# Run tests
bun run test

# Type check
bun run typecheck

# Run Storybook (UI package)
cd packages/ui && bun run storybook
```

### Environment Variables

Create a `.env.local` in `apps/web/`:

```
MONGODB_URI=mongodb://localhost:27017/merlynn
```

The app auto-seeds 25 realistic financial transactions on first load.

## Stack Alignment

Mapping each technology to the Merlynn Intelligence Technologies JD requirements:

| JD Requirement      | Technology Used                                                    |
| ------------------- | ------------------------------------------------------------------ |
| React / Next.js     | Next.js 15 with App Router, Server Components                      |
| TypeScript          | Strict mode across all packages, no `any` types                    |
| MongoDB             | Mongoose ODM with connection pooling, indexed queries              |
| Component Libraries | Radix UI primitives with custom Tailwind styling                   |
| State Management    | TanStack React Query for server state, React hooks for local state |
| Testing             | Jest + MongoDB Memory Server (unit), Cypress (e2e)                 |
| Monorepo            | Turborepo with npm workspaces                                      |
| CI/CD               | GitHub Actions (lint, typecheck, test, build)                      |
| Data Visualization  | SHAP value bar charts, risk score indicators                       |

## Key Concepts Demonstrated

- **Server Components vs Client Components boundary** — Dashboard and detail pages are Server Components that fetch directly from MongoDB. Interactive elements (dialogs, forms, query-cached lists) are Client Components.
- **React Query for server state** — `DecisionList` uses TanStack Query for client-side caching and cache invalidation after mutations.
- **Radix UI accessible primitives** — Dialog, Select, and Slot primitives provide keyboard navigation, focus management, and screen reader support out of the box.
- **MongoDB Memory Server for isolated tests** — Jest tests spin up an in-memory MongoDB instance, ensuring tests are fast, deterministic, and require no external database.
- **Turborepo for monorepo orchestration** — Shared `@merlynn/db` and `@merlynn/ui` packages with proper dependency graph and task caching.
- **Simulated risk assessment** — POST endpoint simulates an ML risk scoring engine with jurisdiction analysis, amount anomaly detection, and SHAP value generation.
