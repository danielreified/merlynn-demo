import { test, expect } from "@playwright/test";

test.describe("Risk Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("displays stat cards on the dashboard", async ({ page }) => {
    const main = page.getByRole("main");
    await expect(main.getByTestId("stat-cards")).toBeVisible();
    await expect(main.getByText("Total Today")).toBeVisible();
    await expect(main.getByText("High Risk Flagged")).toBeVisible();
    await expect(main.getByText("Accuracy Rate")).toBeVisible();
    await expect(main.getByText("Avg Confidence")).toBeVisible();
  });

  test("displays the decisions table", async ({ page }) => {
    const main = page.getByRole("main");
    await expect(main.getByText("Recent Decisions")).toBeVisible();
    const table = main.locator("table");
    await expect(table).toBeVisible();
    await expect(table.locator("tbody tr")).not.toHaveCount(0);
  });

  test("navigates to a decision detail page", async ({ page }) => {
    const main = page.getByRole("main");
    await main.locator("table tbody tr").first().locator("a").first().click();
    await expect(page).toHaveURL(/\/decisions\//);
    await expect(page.getByText("Risk Score")).toBeVisible();
    await expect(page.getByTestId("shap-values")).toBeVisible();
    await expect(page.getByText("Factor Contributions")).toBeVisible();
  });

  test("can navigate back to dashboard from detail page", async ({ page }) => {
    const main = page.getByRole("main");
    await main.locator("table tbody tr").first().locator("a").first().click();
    await page.getByText("Back to Decisions").click();
    await expect(page).toHaveURL(/\/decisions/);
  });
});
