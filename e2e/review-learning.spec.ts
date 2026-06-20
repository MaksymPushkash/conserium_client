import { expect, test } from "@playwright/test";
import { mockApi, signIn } from "./product-polish-fixtures";

test.describe("review learning flows", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await signIn(page);
  });

  test("quiz history can be retried and submitted", async ({ page }) => {
    await page.goto("/review");

    await expect(page.getByRole("heading", { name: "Review", exact: true })).toBeVisible();
    await expect(page.getByText("Weak areas")).toBeVisible();
    await expect(page.getByText("Cloud durability x2")).toBeVisible();
    await expect(page.getByText("Retry saved quiz")).toBeVisible();

    await page.getByText("Retry saved quiz").click();
    await expect(page.getByText("What keeps cloud storage durable?")).toBeVisible();
    await page.getByRole("button", { name: /Replication/i }).click();
    await page.getByRole("button", { name: "Submit quiz" }).click();
    await expect(page.getByText("Score: 1/1")).toBeVisible();
  });

  test("learning path tracks completion and supports regeneration", async ({ page }) => {
    await page.goto("/review");

    await expect(page.getByText("Learning path: Cloud A")).toBeVisible();
    await expect(page.getByText("0/1 complete - 0%")).toBeVisible();
    await page.getByRole("button", { name: "Mark step done" }).click();
    await expect(page.getByText("1/1 complete - 100%")).toBeVisible();

    await page.getByRole("button", { name: /Regenerate/i }).click();
    await expect(page.getByText("Review durability and replication details.")).toBeVisible();
  });
});
