import { expect, test } from "@playwright/test";

test.describe("core user journey", () => {
  test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, "Set E2E_EMAIL and E2E_PASSWORD to run authenticated smoke tests.");

  test("login, upload text, ask scoped question, open source, edit note version", async ({ page }) => {
    await page.goto("/auth");
    await page.getByPlaceholder("Email").fill(process.env.E2E_EMAIL!);
    await page.getByPlaceholder("Password").fill(process.env.E2E_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);

    await page.goto("/ingest");
    await page.getByPlaceholder("Title").fill("Playwright smoke source");
    await page.getByPlaceholder("Paste notes, markdown, or raw text").fill("Cortex smoke test content mentions scoped retrieval.");
    await page.getByRole("button", { name: /queue ingestion/i }).click();
    await expect(page.getByText(/waiting for worker status|ready|processing/i)).toBeVisible();

    await page.goto("/chat");
    await page.getByPlaceholder("Ask about this topic...").fill("What does the smoke source mention?");
    await page.keyboard.press("Enter");
    await expect(page.getByText(/smoke|retrieval/i)).toBeVisible({ timeout: 30_000 });
    await page.getByText(/source/i).first().click();

    await page.goto("/notes");
    await page.getByRole("button", { name: /create note/i }).click();
    await page.getByPlaceholder(/title/i).fill("Smoke note");
    await page.getByPlaceholder(/write/i).fill("# Smoke\n\nVersioned note body.");
    await expect(page.getByText("Smoke note")).toBeVisible();
  });
});
