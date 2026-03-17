# @merlynn/ui

Radix UI + Tailwind CSS component library for the Merlynn Risk Monitor platform. Built with a dark fintech aesthetic (Bloomberg-terminal-inspired), accessible primitives, and type-safe variants via Class Variance Authority.

---

## Installation

This package is part of the monorepo and is consumed via workspace resolution:

```ts
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  cn,
} from "@merlynn/ui";
```

---

## Components

### Badge

Risk-level indicator with color-coded variants.

```tsx
<Badge variant="high">HIGH</Badge>
<Badge variant="medium">MEDIUM</Badge>
<Badge variant="low">LOW</Badge>
<Badge variant="default">N/A</Badge>
```

| Prop        | Type                                             | Default     |
| ----------- | ------------------------------------------------ | ----------- |
| `variant`   | `"high"` \| `"medium"` \| `"low"` \| `"default"` | `"default"` |
| `className` | `string`                                         | —           |
| `children`  | `ReactNode`                                      | —           |

**Styling**: Semi-transparent backgrounds with matching borders. Uppercase text with letter spacing.

| Variant   | Color   |
| --------- | ------- |
| `high`    | Red     |
| `medium`  | Amber   |
| `low`     | Emerald |
| `default` | Slate   |

### Button

Multi-variant button with forwarded ref and `asChild` composition support.

```tsx
<Button variant="default" size="default">Submit</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
<Button asChild><a href="/dashboard">Go</a></Button>
```

| Prop       | Type                                                       | Default     |
| ---------- | ---------------------------------------------------------- | ----------- |
| `variant`  | `"default"` \| `"destructive"` \| `"outline"` \| `"ghost"` | `"default"` |
| `size`     | `"default"` \| `"sm"` \| `"lg"` \| `"icon"`                | `"default"` |
| `asChild`  | `boolean`                                                  | `false`     |
| `disabled` | `boolean`                                                  | `false`     |

Uses `Radix Slot` when `asChild` is true, allowing the button's styles to be applied to a child element (e.g., an anchor tag).

### Card (Compound)

Container component with dark glass-morphism styling.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Risk Score</CardTitle>
  </CardHeader>
  <CardContent>
    <p>85 / 100</p>
  </CardContent>
</Card>
```

| Component     | Element | Notes                                     |
| ------------- | ------- | ----------------------------------------- |
| `Card`        | `div`   | Rounded-xl, border, backdrop-blur, shadow |
| `CardHeader`  | `div`   | Padding with flex-col layout              |
| `CardTitle`   | `h3`    | Semibold, tracking-tight                  |
| `CardContent` | `div`   | Padding (top padding removed)             |

### Dialog

Modal dialog built on Radix UI Dialog primitives with portal rendering and animations.

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Review Decision</DialogTitle>
    </DialogHeader>
    <p>Content here</p>
  </DialogContent>
</Dialog>
```

| Component       | Notes                                                |
| --------------- | ---------------------------------------------------- |
| `Dialog`        | Radix root (controls open state)                     |
| `DialogTrigger` | Opens the dialog                                     |
| `DialogContent` | Portal-rendered, centered overlay with backdrop blur |
| `DialogHeader`  | Flex column with spacing                             |
| `DialogTitle`   | Large semibold heading                               |
| `DialogClose`   | Close button                                         |

**Animations**: fade-in/out, zoom-in/out (95% to 100%), slide from bottom.

### Select

Dropdown select built on Radix UI Select primitives.

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Risk Level" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="HIGH">High Risk</SelectItem>
    <SelectItem value="MEDIUM">Medium Risk</SelectItem>
    <SelectItem value="LOW">Low Risk</SelectItem>
  </SelectContent>
</Select>
```

| Component       | Notes                                         |
| --------------- | --------------------------------------------- |
| `Select`        | Radix root                                    |
| `SelectTrigger` | Styled trigger with chevron icon              |
| `SelectValue`   | Displays selected value or placeholder        |
| `SelectContent` | Portal-rendered dropdown with animations      |
| `SelectItem`    | Option with checkmark indicator when selected |

---

## Utilities

### `cn(...inputs)`

Combines `clsx` and `tailwind-merge` for safe class name composition:

```ts
import { cn } from "@merlynn/ui";

<div className={cn("p-4 text-white", isActive && "bg-blue-600", className)} />
```

---

## Design System

### Color Palette

| Token           | Value         | Usage                  |
| --------------- | ------------- | ---------------------- |
| `background`    | `#0a0f1e`     | Page background        |
| `surface`       | `#111827`     | Card backgrounds       |
| `surface-light` | `#1e293b`     | Elevated surfaces      |
| `primary`       | `#2563eb`     | Buttons, links         |
| `risk-high`     | `#ef4444`     | High risk indicators   |
| `risk-medium`   | `#f59e0b`     | Medium risk indicators |
| `risk-low`      | `#10b981`     | Low risk indicators    |
| Text            | Slate 100–500 | Content hierarchy      |
| Borders         | Slate 700–800 | Dividers, outlines     |

### Typography

- Font stack: Inter (Google Fonts), system fallbacks
- Scale: `text-3xl` down to `text-xs`
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Custom Animations

Defined in `tailwind.config.ts`:

- `animate-in` / `animate-out` — Enter/exit transitions
- `fade-in` / `fade-out` — Opacity transitions
- `zoom-in` / `zoom-out` — Scale 95% to 100%
- `slide-in-from-bottom` — Translate Y for modals

---

## Storybook

Interactive component documentation and development environment.

```bash
# Dev server (port 6006)
bun run storybook

# Build static site
bun run build-storybook
```

### Stories

| Story  | Variants                                                                  |
| ------ | ------------------------------------------------------------------------- |
| Badge  | High, Medium, Low, Default, AllVariants                                   |
| Button | Default, Destructive, Outline, Ghost, Small, Large, Disabled, AllVariants |
| Card   | StatCard, HighRiskCard, Dashboard Row, Decision Detail                    |
| Dialog | Default, Decision Review, Confirm Deletion                                |
| Select | Default (risk levels), Filter Panel (4 selects)                           |

### Style Guide Stories

- **Colors** — Full palette with hex values
- **Typography** — Type scale, font weights
- **Spacing** — Scale, border radius, shadows

### Configuration

- Framework: `@storybook/react-vite`
- Addons: `@storybook/addon-a11y` (accessibility), `@storybook/addon-vitest` (testing)
- Auto-docs: Enabled via `tags: ["autodocs"]`
- Default background: `#0a0f1e` (dark)

---

## Testing

### Interaction Tests

```bash
bun run test:storybook
```

Vitest-based tests that run Storybook stories and verify component behavior (click handlers, disabled states, text rendering).

### Visual Regression Tests

```bash
# Run tests (requires Docker for consistent screenshots)
bun run test:visual

# Update baseline screenshots
bun run test:visual:update
```

Vitest + Playwright captures screenshots of stories and compares against baselines stored in `stories/__screenshots__/`.

**Tested components**: Badge (3 variants), Button (4 variants), Card (2 stories), Dialog (open state), Select (open state).

**How it works**:

1. Starts headless Chromium via Playwright
2. Navigates to each Storybook story URL
3. Waits 1500ms for animations/fonts to settle
4. Captures screenshot and compares to baseline PNG

---

## Tailwind Configuration

The package ships its own `tailwind.config.ts` with the custom color palette, animations, and the `tailwindcss-animate` plugin. Consuming apps should include `../../packages/ui/src/**` in their Tailwind content paths to pick up the component classes.
