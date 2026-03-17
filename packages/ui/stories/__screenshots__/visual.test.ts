import { expect, describe, test } from "vitest";
import { commands } from "@vitest/browser/context";

// Base URL is injected via Vitest's `define` in vitest.visual.config.ts
// so it works both locally (localhost:6006) and in Docker (storybook:6006).
declare const __STORYBOOK_URL__: string;
const STORYBOOK_URL = __STORYBOOK_URL__ + "/iframe.html";

function storyUrl(id: string): string {
  return `${STORYBOOK_URL}?id=${id}&viewMode=story`;
}

// Typed wrapper for our custom command (defined in vitest.visual.config.ts).
// Opens a new Playwright page, navigates to the story, and returns a base64 screenshot.
const screenshot = (
  commands as unknown as {
    screenshotStory: (url: string) => Promise<string>;
  }
).screenshotStory;

describe("Badge", () => {
  test("High", async () => {
    await expect(screenshot(storyUrl("components-badge--high"))).resolves.toMatchSnapshot();
  });

  test("Medium", async () => {
    await expect(screenshot(storyUrl("components-badge--medium"))).resolves.toMatchSnapshot();
  });

  test("Low", async () => {
    await expect(screenshot(storyUrl("components-badge--low"))).resolves.toMatchSnapshot();
  });
});

describe("Button", () => {
  test("Default", async () => {
    await expect(screenshot(storyUrl("components-button--default"))).resolves.toMatchSnapshot();
  });

  test("Destructive", async () => {
    await expect(screenshot(storyUrl("components-button--destructive"))).resolves.toMatchSnapshot();
  });

  test("Outline", async () => {
    await expect(screenshot(storyUrl("components-button--outline"))).resolves.toMatchSnapshot();
  });

  test("Disabled", async () => {
    await expect(screenshot(storyUrl("components-button--disabled"))).resolves.toMatchSnapshot();
  });
});

describe("Card", () => {
  test("StatCard", async () => {
    await expect(screenshot(storyUrl("components-card--stat-card"))).resolves.toMatchSnapshot();
  });

  test("HighRiskCard", async () => {
    await expect(
      screenshot(storyUrl("components-card--high-risk-card"))
    ).resolves.toMatchSnapshot();
  });
});

describe("Dialog", () => {
  test("Default (open)", async () => {
    // The story's play function auto-opens the dialog
    await expect(screenshot(storyUrl("components-dialog--default"))).resolves.toMatchSnapshot();
  });
});

describe("Select", () => {
  test("Default (open)", async () => {
    // The story's play function auto-opens the dropdown
    await expect(screenshot(storyUrl("components-select--default"))).resolves.toMatchSnapshot();
  });
});
