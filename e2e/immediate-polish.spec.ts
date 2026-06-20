import { expect, test, type Page } from "@playwright/test";
import { mockApi, signIn } from "./product-polish-fixtures";

const protectedRoutes = ["/ingest", "/processing", "/settings#appearance", "/settings#integrations"];

async function prepareSignedInPage(page: Page, theme: "dark" | "light") {
  await mockApi(page, { theme });
  await page.addInitScript((selectedTheme) => {
    window.localStorage.setItem("conserium-theme", selectedTheme);
  }, theme);
  await signIn(page);
}

async function expectNoInvisiblePrimaryControls(page: Page) {
  const failures = await page.evaluate(() => {
    function luminance(value: string) {
      const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return null;
      const channels = match.slice(1, 4).map((channel) => {
        const normalized = Number(channel) / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    }

    function contrast(foreground: string, background: string) {
      const fg = luminance(foreground);
      const bg = luminance(background);
      if (fg === null || bg === null) return 21;
      const lighter = Math.max(fg, bg);
      const darker = Math.min(fg, bg);
      return (lighter + 0.05) / (darker + 0.05);
    }

    function effectiveBackground(element: Element) {
      let current: Element | null = element;
      while (current) {
        const color = window.getComputedStyle(current).backgroundColor;
        if (color && !color.endsWith(", 0)") && color !== "transparent" && color !== "rgba(0, 0, 0, 0)") {
          return color;
        }
        current = current.parentElement;
      }
      return window.getComputedStyle(document.body).backgroundColor;
    }

    return Array.from(document.querySelectorAll("button, a, input, select, textarea"))
      .filter((element) => {
        const box = element.getBoundingClientRect();
        const styles = window.getComputedStyle(element);
        return box.width > 0 && box.height > 0 && styles.visibility !== "hidden" && styles.display !== "none";
      })
      .map((element) => {
        const styles = window.getComputedStyle(element);
        return {
          text: element.textContent?.trim() || element.getAttribute("placeholder") || element.getAttribute("aria-label") || element.tagName,
          contrast: contrast(styles.color, effectiveBackground(element)),
        };
      })
      .filter((item) => item.contrast < 2.4);
  });

  expect(failures).toEqual([]);
}

test.describe("immediate polish visual coverage", () => {
  for (const theme of ["dark", "light"] as const) {
    test(`${theme} theme keeps main pages readable`, async ({ page }) => {
      await prepareSignedInPage(page, theme);
      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page.locator("body")).toBeVisible();
        await expectNoInvisiblePrimaryControls(page);
      }
    });
  }

  test("public collection Ask returns a shareable grounded answer", async ({ page }) => {
    await mockApi(page);
    await page.goto("/public/public-cloud");

    await expect(page.getByRole("heading", { name: "Public Cloud Notes" })).toBeVisible();
    await page.getByPlaceholder("Ask a question about these shared sources").fill("How is cloud storage durable?");
    await page.getByRole("button", { name: "Ask" }).click();

    await expect(page.getByText("Cloud storage is durable because data is replicated")).toBeVisible();
    await expect(page.getByText("Share this answer:")).toBeVisible();
    await expect(page.getByRole("link", { name: "Open" })).toHaveAttribute("href", "/public/answers/share-cloud");
    await expect(page.getByText("Cloud Storage Primer").first()).toBeVisible();
    await expectNoInvisiblePrimaryControls(page);
  });

  test("public answer page renders citations without private identifiers", async ({ page }) => {
    await mockApi(page);
    await page.goto("/public/answers/share-cloud");

    await expect(page.getByRole("heading", { name: "How is cloud storage durable?" })).toBeVisible();
    await expect(page.getByText("Cloud storage is durable because data is replicated")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Citations" })).toBeVisible();
    await expect(page.getByText("Cloud Storage Primer")).toBeVisible();
    await expect(page.getByText("public-doc-1")).toHaveCount(0);
    await expect(page.getByText("chunk-")).toHaveCount(0);
    await expectNoInvisiblePrimaryControls(page);
  });
});
