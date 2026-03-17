import { defineConfig } from "vitest/config";
import type { BrowserCommand } from "vitest/node";

// Custom command: opens the story URL in a new Playwright page,
// waits for #storybook-root to have content (+ play functions to settle),
// takes a screenshot, and returns the base64 PNG data.
const screenshotStory: BrowserCommand<[url: string]> = async (context, url) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Vitest browser command context typing is incomplete
  const browserContext = (context as any).context;
  const newPage = await browserContext.newPage();
  try {
    await newPage.goto(url, { waitUntil: "networkidle" });
    await newPage.waitForFunction(
      () => (document.querySelector("#storybook-root")?.children.length ?? 0) > 0,
      { timeout: 10_000 }
    );
    // Wait for play functions to execute and animations/fonts to settle
    await new Promise((r) => setTimeout(r, 1500));
    const buffer = await newPage.screenshot();
    return buffer.toString("base64");
  } finally {
    await newPage.close();
  }
};

const storybookUrl = process.env.STORYBOOK_URL || "http://localhost:6006";

export default defineConfig({
  define: {
    __STORYBOOK_URL__: JSON.stringify(storybookUrl),
  },
  test: {
    name: "visual",
    browser: {
      enabled: true,
      headless: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
      commands: { screenshotStory },
    },
    include: ["stories/__screenshots__/**/*.test.ts"],
  },
});
