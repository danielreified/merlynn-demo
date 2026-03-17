# Merlynn Risk Monitor — Web App

Next.js 15 full-stack application for the Merlynn Risk Monitor platform. Combines server-rendered dashboard pages, client-side interactive views, a Hono REST API with auto-generated OpenAPI docs, and NextAuth authentication.

**Demo credentials**: `admin@merlynn.co.za` / `demo1234`

---

## Quick Start

```bash
# From monorepo root
bun install
bun run dev

# Or from this directory
bun run dev
```

Runs at `http://localhost:3000`. Seeds 25 sample transactions and a default admin user on first load.

### Environment Variables

Create `.env.local` in this directory:

```bash
MONGODB_URI=mongodb://localhost:27017/merlynn
AUTH_SECRET=your-random-secret-32-bytes-minimum
AUTH_URL=http://localhost:3000
```

---

## Pages

### Dashboard (`/dashboard`)

**Server Component** (`force-dynamic`) — fetches directly from MongoDB with no client-side data loading.

- **StatsCards** — Total decisions today, high-risk count, accuracy rate, average confidence
- **RiskChart** — Horizontal bars showing HIGH / MEDIUM / LOW breakdown with percentages
- **Recent Decisions table** — Last 7 days, links to detail pages
- **ActiveModels sidebar** — Deployed models with status indicators

### Decisions (`/decisions`)

**Client Component** with React Query for caching and filter state.

- Paginated table (20 per page, max 100 pages)
- **FilterBar** — Search (supplier/transaction ID), risk level, model name, date range
- CSV and JSON export of filtered results
- Feedback indicators per row (CORRECT / PARTIAL / INCORRECT)
- Click-through to decision detail

### Decision Detail (`/decisions/[id]`)

**Server Component** (`force-dynamic`) with client interactive panels.

- Risk score card with color-coded background
- **ConfidenceGauge** — SVG circular gauge (emerald >= 80%, amber >= 60%, red < 60%)
- Transaction metadata grid (ID, type, supplier, country, amount)
- Risk explanation text
- **SHAP Values** — Horizontal bar chart of factor contributions
- **FeedbackPanel** — 3-button rating (CORRECT / PARTIAL / INCORRECT) + note, submits via server action
- **AskTomPanel** — Chat interface with suggested questions and mock AI responses (800–1400ms delay)
- Previous / next navigation

### Models (`/models`)

**Client Component** — Grid of model cards.

- Status badges: draft (gray), training (amber), deployed (green)
- "New Model" button → `/models/new`
- Click-through to edit → `/models/[id]/edit`

### Model Editor (`/models/[id]/edit`)

**Client Component** with `@xyflow/react` canvas.

- Drag-and-drop node graph editor
- **Node types**: Factor (blue), Decision (amber), Output (color-coded by risk level)
- Floating toolbar to add new nodes
- **FactorEditPanel** — Right sidebar for editing selected node properties (label, description, weight/threshold/riskLevel)
- MiniMap and zoom controls
- Debounced auto-save (1500ms) via PUT `/api/models/:id`

### Model Training (`/models/[id]/train`)

**Client Component** — Simulated training flow.

- 20 generated scenarios with realistic transaction details
- **ScenarioCard** — Transaction details + risk factors + Approve/Flag/Reject buttons
- **TrainingProgress** — SVG progress ring, decision breakdown bars, consistency score
- Complete button enabled after 10+ scenarios

### Settings (`/settings`)

**Client Component** — API key management.

- Create new keys (format: `mk_live_` + 48 hex characters)
- Key displayed once on creation (must copy immediately)
- Keys table with prefix, name, last used, revoked status
- Revoke button (permanent, one-way)
- Uses server actions: `createApiKey`, `revokeApiKey`, `listApiKeys`

### Login (`/login`)

Unauthenticated page with email/password form. Redirects to `/dashboard` on success.

---

## API

Built with [Hono](https://hono.dev/) + [`@hono/zod-openapi`](https://github.com/honojs/middleware/tree/main/packages/zod-openapi) for auto-generated OpenAPI specs from Zod schemas.

### Entry Point

`app/api/[[...route]]/route.ts` — Next.js catch-all route that delegates all `/api/*` requests to Hono via `handle()` from `hono/vercel`.

### Interactive Docs

- **Scalar UI**: `http://localhost:3000/api/docs`
- **OpenAPI spec**: `http://localhost:3000/api/openapi.json`

### Public Endpoints

| Method | Path                | Description          |
| ------ | ------------------- | -------------------- |
| GET    | `/api/health`       | Health check         |
| GET    | `/api/openapi.json` | Auto-generated spec  |
| GET    | `/api/docs`         | Scalar API reference |

### Decisions (authenticated)

| Method | Path                    | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| GET    | `/api/decisions`        | List decisions (paginated, filtered) |
| GET    | `/api/decisions/export` | Export as CSV or JSON                |
| GET    | `/api/decisions/:id`    | Get a single decision                |
| POST   | `/api/decisions`        | Create decision (auto risk-assessed) |

**Query parameters**: `page`, `limit`, `riskLevel`, `search`, `modelName`, `dateFrom`, `dateTo`, `format` (export only)

### Models (authenticated)

| Method | Path              | Description  |
| ------ | ----------------- | ------------ |
| GET    | `/api/models`     | List models  |
| GET    | `/api/models/:id` | Get model    |
| POST   | `/api/models`     | Create model |
| PUT    | `/api/models/:id` | Update model |
| DELETE | `/api/models/:id` | Delete model |

### Request Validation

All POST/PUT bodies are validated automatically by `@hono/zod-openapi` before handlers run. Invalid requests return:

```json
{ "error": "Validation failed", "details": [...zod issues] }
```

Schemas are centralized in `lib/api/schemas.ts`.

---

## Authentication

### NextAuth Configuration (`lib/auth.ts`)

- **Strategy**: JWT (stateless sessions)
- **Provider**: Credentials (email/password)
- **Password hashing**: bcryptjs
- **Session object**: `{ id, email, name, role }`
- **Roles**: `ANALYST` | `ADMIN`
- Auto-seeds default admin user on first login attempt

### Middleware (`middleware.ts`)

Redirects unauthenticated users to `/login`. Allows: `/login`, `/api/*`, `/_next/*`, static files.

### API Auth (`lib/api/auth.ts`)

`flexAuth` middleware — checks in order:

1. **Bearer token** → SHA-256 hash → in-memory cache (5min TTL) → MongoDB lookup
2. **Session cookie** → NextAuth JWT verification via `getToken()`
3. **Neither** → 401

---

## Risk Simulation (`lib/risk.ts`)

`simulateRiskAssessment()` generates risk scores based on:

| Factor              | Logic                                                      |
| ------------------- | ---------------------------------------------------------- |
| **Jurisdiction**    | High-risk countries (+30), medium-risk (+15), others (-10) |
| **Amount anomaly**  | > $1M (+25), > $500K (+10), else (-5)                      |
| **Supplier tenure** | Always +15 (simulated)                                     |

Returns: `riskLevel`, `riskScore` (0–100), `explanation`, `shapValues[]`, `outcome`

Score mapping: >= 70 → HIGH/FLAGGED, >= 40 → MEDIUM/REVIEWING, < 40 → LOW/PASSED

---

## Server Actions (`app/actions/`)

### `decisions.ts`

- `createDecision(prevState, formData)` — Creates decision with risk assessment, revalidates path
- `submitFeedback(decisionId, rating, note)` — Updates decision feedback subdocument

### `apiKeys.ts`

- `createApiKey(name)` — Generates key, stores SHA-256 hash, returns raw key once
- `revokeApiKey(keyId)` — Sets `revoked: true` (permanent)
- `listApiKeys()` — Returns current user's keys with masked values

---

## Components

### Layout

| Component    | Type   | Description                                             |
| ------------ | ------ | ------------------------------------------------------- |
| `AuthLayout` | Server | Wraps pages with Sidebar, skips on `/login`             |
| `Sidebar`    | Client | Fixed 64px left nav with logo, links, models, user info |

### Dashboard

| Component      | Type   | Description                             |
| -------------- | ------ | --------------------------------------- |
| `StatsCards`   | Client | 4 metric cards with icons               |
| `RiskChart`    | Client | Horizontal bar chart for risk breakdown |
| `ActiveModels` | Client | Model list with status dots             |

### Decisions

| Component         | Type   | Description                                   |
| ----------------- | ------ | --------------------------------------------- |
| `FilterBar`       | Client | Search, select, and date inputs for filtering |
| `Pagination`      | Client | Page navigation with total info               |
| `ConfidenceGauge` | Client | SVG circular gauge (0–100%)                   |
| `FeedbackPanel`   | Client | Rating buttons + note textarea                |
| `AskTomPanel`     | Client | Chat interface with suggested questions       |

### Models

| Component          | Type   | Description                                       |
| ------------------ | ------ | ------------------------------------------------- |
| `ModelCanvas`      | Client | @xyflow/react graph editor with custom node types |
| `FactorNode`       | Client | Blue-bordered factor node                         |
| `DecisionNode`     | Client | Amber-bordered decision node                      |
| `OutputNode`       | Client | Risk-colored output node with badge               |
| `FactorEditPanel`  | Client | Property editor sidebar for selected node         |
| `ScenarioCard`     | Client | Training scenario with action buttons             |
| `TrainingProgress` | Client | Progress ring + decision stats                    |

---

## Monorepo Dependencies

- **`@merlynn/db`** — Mongoose models (`Decision`, `User`, `ApiKey`, `DecisionModel`), `connectDB`, types
- **`@merlynn/ui`** — `Badge`, `Button`, `Card`, `Dialog`, `Select`, `cn` utility

Both are transpiled via `next.config.ts`:

```ts
transpilePackages: ["@merlynn/ui", "@merlynn/db"];
```

---

## Testing

### Cypress E2E

```bash
# Interactive
bun run cypress

# Headless (CI)
bun run cypress:headless
```

Config: `cypress.config.ts` — baseUrl `http://localhost:3000`, viewport 1280x720.

Test spec (`cypress/e2e/decisions.cy.ts`):

- Dashboard stat cards visibility
- Decisions table rendering
- Navigation to decision detail (checks SHAP values)
- Back navigation

---

## Scripts

| Command                    | Description                    |
| -------------------------- | ------------------------------ |
| `bun run dev`              | Next.js dev server (port 3000) |
| `bun run build`            | Production build               |
| `bun run start`            | Start production server        |
| `bun run lint`             | ESLint                         |
| `bun run typecheck`        | TypeScript type checking       |
| `bun run cypress`          | Cypress interactive mode       |
| `bun run cypress:headless` | Cypress headless               |

---

## Configuration

| File                 | Purpose                                                     |
| -------------------- | ----------------------------------------------------------- |
| `next.config.ts`     | Standalone output, transpile workspace packages             |
| `tailwind.config.ts` | Dark theme colors, includes `packages/ui/src` content paths |
| `tsconfig.json`      | Strict mode, `@/*` path alias, ES2022 target                |
| `postcss.config.js`  | Tailwind + Autoprefixer                                     |
| `globals.css`        | Tailwind directives, @xyflow/react styles, custom scrollbar |
| `middleware.ts`      | Auth redirect for unauthenticated users                     |
