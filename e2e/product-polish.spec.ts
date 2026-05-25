import { expect, test } from "@playwright/test";
import { comparisonResult, documentDetail, draftDetail, graphNote, json, mockApi, repoSyncs, signIn } from "./product-polish-fixtures";

test.describe("product polish mocked coverage", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await signIn(page);
  });

  test("graph supports URL state, viewport controls, and persisted concerns", async ({ page }) => {
    await page.goto("/graph?view=list&q=cloud");
    await expect(page.getByRole("heading", { name: "Knowledge Graph" })).toBeVisible();
    await expect(page.getByText("Clusters")).toBeVisible();

    await page.getByRole("button", { name: "Graph" }).click();
    await expect(page).not.toHaveURL(/view=list/);
    await expect(page.getByRole("button", { name: "Zoom in" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset graph viewport" })).toBeVisible();

    await page.getByRole("button", { name: "Select Cloud", exact: true }).click();
    await expect(page).toHaveURL(/node=topic-cloud/);
    await page.getByLabel("Tag filter").fill("cloud");
    await expect(page).toHaveURL(/tag=cloud/);
    await page.getByRole("button", { name: "Select Cloud A", exact: true }).click();
    await expect(page.getByText("Cloud storage notes.").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Ask about this/i })).toHaveAttribute("href", "/chat?document=doc-1");
    await page.getByRole("button", { name: "Create note from node" }).click();
    await expect(page).toHaveURL(/\/notes\?note=note-graph/);

    await page.goto("/graph?node=topic-cloud");
    await page.getByRole("button", { name: /Flag a concern/i }).click();
    await page.getByPlaceholder("What looks stale, weak, duplicated, or misleading?").fill("Needs review");
    await page.getByRole("button", { name: "Save concern" }).click();
    await expect(page.getByText("Concern saved for review.")).toBeVisible();
  });

  test("graph topic note keeps active collection scope", async ({ page }) => {
    let notePayload: Record<string, unknown> = {};
    await page.route("**/api/v1/notes", async (route) => {
      if (route.request().method() === "POST") {
        notePayload = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>;
        return json(route, graphNote(), 201);
      }
      return route.fallback();
    });

    await page.goto("/graph?collection=collection-1&node=topic-cloud");
    await page.getByRole("button", { name: "Create note from node" }).click();

    await expect(page).toHaveURL(/\/notes\?note=note-graph/);
    expect(notePayload.collection_id).toBe("collection-1");
  });

  test("graph topic management calls real topic endpoints", async ({ page }) => {
    const requests: Array<{ path: string; body: Record<string, unknown> }> = [];
    await page.route("**/api/v1/topics/**", async (route) => {
      if (route.request().method() === "GET") return route.fallback();
      const url = new URL(route.request().url());
      requests.push({
        path: url.pathname.replace("/api/v1", ""),
        body: JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>,
      });
      return json(route, { name: "Cloud", document_count: 2, last_document_at: "2026-05-20T00:00:00Z", source_names: ["Cloud", "storage"], pinned: true, ignored: false });
    });

    await page.goto("/graph?node=topic-cloud");
    await page.getByRole("button", { name: "Rename topic" }).click();
    await expect.poll(() => requests.length).toBe(1);
    await page.getByRole("button", { name: "Merge topics" }).click();
    await expect.poll(() => requests.length).toBe(2);
    await page.getByRole("button", { name: "Pin topic" }).click();
    await expect.poll(() => requests.length).toBe(3);
    await page.getByRole("button", { name: "Ignore topic" }).click();
    await page.getByRole("button", { name: "Confirm ignore" }).click();
    await expect.poll(() => requests.length).toBe(4);

    expect(requests).toEqual([
      { path: "/topics/Cloud", body: { display_name: "Cloud" } },
      { path: "/topics/Cloud/merge", body: { source_names: ["Cloud", "storage"] } },
      { path: "/topics/Cloud/pin", body: { pinned: true } },
      { path: "/topics/Cloud/ignore", body: { ignored: true } },
    ]);
  });

  test("drafts and compare show insufficient-context errors without real backend", async ({ page }) => {
    let restoreCount = 0;
    await page.route("**/api/v1/drafts/draft-1/versions/version-0/restore", async (route) => {
      restoreCount += 1;
      return json(route, draftDetail());
    });

    await page.goto("/drafts");
    await expect(page.getByText("Editable outline")).toBeVisible();
    await expect(page.locator("textarea").nth(1)).toHaveValue("Context");
    await page.getByRole("button", { name: /Brief: cloud architecture/i }).click();
    await expect(page.getByText("Saved draft [1].")).toBeVisible();
    await page.getByRole("button", { name: /Restore/i }).click();
    expect(restoreCount).toBe(1);
    await page.getByPlaceholder("Write an article about Python generators").fill("Write about cloud architecture");
    await page.getByRole("button", { name: /Outline/i }).click();
    await expect(page.locator("textarea").nth(2)).toHaveValue("Evidence");
    await page.getByRole("button", { name: /Generate draft/i }).click();
    await expect(page.getByText("Saved context is insufficient for this draft.")).toBeVisible();

    await page.goto("/compare");
    await page.locator("select").first().selectOption("doc-1");
    await page.locator("select").nth(1).selectOption("doc-2");
    await page.getByRole("button", { name: /Compare documents/i }).click();
    await expect(page.getByText("The provided context does not contain enough relevant information to answer this question.")).toBeVisible();
  });

  test("ingest and settings render primary interactions from mocked API", async ({ page }) => {
    await page.goto("/ingest");
    await expect(page.getByPlaceholder("Title")).toBeVisible();
    await page.getByRole("button", { name: /URL Import an article/i }).click();
    await expect(page.getByPlaceholder("Article URL")).toBeVisible();

    await page.goto("/settings#integrations");
    await expect(page.getByRole("heading", { name: "Integrations" })).toBeVisible();
    await expect(page.getByText("Notion")).toBeVisible();
    await expect(page.getByText("Public API keys")).toBeVisible();
    await expect(page.getByText("ctx_test_123...")).toBeVisible();
  });

  test("dashboard action cards and command palette fit in viewport", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Upload source")).toBeVisible();
    await expect(page.getByText("Ask your knowledge")).toBeVisible();
    await expect(page.getByText("Review gaps")).toBeVisible();

    await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
    await expect(page.getByPlaceholder("Search pages, actions, sources...")).toBeVisible();
    const box = await page.getByPlaceholder("Search pages, actions, sources...").locator("..").boundingBox();
    expect(box?.y ?? 0).toBeGreaterThanOrEqual(0);
  });

  test("repo sync warning states and collections templates render", async ({ page }) => {
    let retryCount = 0;
    await page.route("**/api/v1/repo-syncs/sync-1/run", async (route) => {
      retryCount += 1;
      return json(route, { repo_sync: repoSyncs().items[0], created: 0, updated: 0, skipped: 0, deleted: 0, warnings: [] });
    });

    await page.goto("/repo-syncs");
    await expect(page.getByText("Needs attention")).toBeVisible();
    await expect(page.getByText("GitHub rate limit or access policy blocked this sync.")).toBeVisible();
    await page.getByRole("button", { name: /Retry/i }).click();
    expect(retryCount).toBe(1);

    await page.goto("/collections");
    await expect(page.getByRole("button", { name: "Programming" })).toBeVisible();
    await page.getByRole("button", { name: "Research" }).click();
    await expect(page.getByPlaceholder("Programming")).toHaveValue("Research");
  });

  test("collection workspace connects scoped documents topics gaps and actions", async ({ page }) => {
    await page.goto("/collections/collection-1");
    await expect(page.getByRole("heading", { name: "Default" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Documents" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Knowledge gaps" })).toBeVisible();
    await expect(page.getByText("How does cloud storage work?")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ask", exact: true }).first()).toHaveAttribute("href", "/chat?collection=collection-1");
    await expect(page.getByRole("link", { name: "Draft", exact: true }).first()).toHaveAttribute("href", "/drafts?collection=collection-1");
    await expect(page.getByRole("link", { name: "Ask", exact: true }).nth(1)).toHaveAttribute("href", "/chat?collection=collection-1&topic=cloud");
    await expect(page.getByRole("link", { name: "Draft", exact: true }).nth(1)).toHaveAttribute("href", "/drafts?collection=collection-1&topic=cloud&gap=cloud--summary");
    await expect(page.getByRole("link", { name: /Cloud A vs Cloud B/i })).toHaveAttribute("href", "/compare?result=compare-1");
  });

  test("compare v2 renders evidence table and creates synthesis outputs", async ({ page }) => {
    let notePayload: Record<string, unknown> = {};
    await page.route("**/api/v1/compare/documents", async (route) => json(route, comparisonResult()));
    await page.route("**/api/v1/notes", async (route) => {
      if (route.request().method() === "POST") {
        notePayload = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>;
        return json(route, graphNote(), 201);
      }
      return route.fallback();
    });
    await page.route("**/api/v1/drafts/generate", async (route) =>
      json(route, {
        draft_id: "draft-compare",
        version_id: "version-compare",
        version_number: 1,
        prompt: "Generate a decision memo",
        template_id: "comparison_memo",
        scope_type: "documents",
        markdown: "# Decision memo",
        sources: [],
        gaps: [],
      }),
    );

    await page.goto("/compare");
    await page.locator("select").first().selectOption("doc-1");
    await page.locator("select").nth(1).selectOption("doc-2");
    await page.getByLabel("Tradeoffs").uncheck();
    await page.getByRole("button", { name: /Compare documents/i }).click();

    await expect(page.getByText("Claims comparison is grounded in [1] and [2].")).toBeVisible();
    await expect(page.getByText("Cloud A claims durable replication.")).toBeVisible();
    await page.getByRole("button", { name: "Note" }).click();
    expect(notePayload.collection_id).toBe("collection-1");
    await expect(page).toHaveURL(/\/notes\?note=note-graph/);
    await page.goto("/compare?result=compare-1");
    await page.getByRole("button", { name: "Memo" }).click();
    await expect(page).toHaveURL(/\/drafts\?draft=draft-compare/);
  });

  test("knowledge gaps show rationale and create notes", async ({ page }) => {
    let notePayload: Record<string, unknown> = {};
    await page.route("**/api/v1/knowledge-gaps/cloud--testing/note", async (route) => {
      notePayload = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>;
      return json(route, graphNote(), 201);
    });

    await page.goto("/knowledge-gaps");
    await expect(page.getByText("1 rubric area(s) are missing; current coverage is 50%.")).toBeVisible();
    await expect(page.getByText("No saved source matched Testing.")).toBeVisible();
    await expect(page.getByText("reference").first()).toBeVisible();
    await page.getByRole("button", { name: /Create note/i }).click();

    await expect(page).toHaveURL(/\/notes\?note=note-graph/);
    expect(notePayload).toEqual({ topic: "cloud", area_name: "Testing" });
  });

  test("processing center shows failed jobs and document timeline", async ({ page }) => {
    let retryCount = 0;
    await page.route("**/api/v1/documents/doc-failed/retry", async (route) => {
      retryCount += 1;
      return json(route, documentDetail("doc-failed", "Failed PDF"));
    });

    await page.goto("/processing");
    await expect(page.getByRole("heading", { name: "Processing center" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Failed PDF" })).toBeVisible();
    await expect(page.getByText("PDF extraction failed.").first()).toBeVisible();
    await expect(page.getByText("GitHub rate limit or access policy blocked this sync.").first()).toBeVisible();
    await page.getByRole("button", { name: /Exports/ }).click();
    await expect(page.getByText("Exports currently run synchronously.")).toBeVisible();
    await page.getByRole("button", { name: /Failed PDF/ }).click();
    await expect(page.getByText("Extracted")).toBeVisible();
    await page.getByRole("button", { name: "Retry failed job" }).click();
    expect(retryCount).toBe(1);
  });

  test("chat history renders citations from mocked sources", async ({ page }) => {
    await page.goto("/chat");
    await page.getByRole("button", { name: "Cloud Q&A" }).click();
    await expect(page.getByText("Cloud answer [1].")).toBeVisible();
    await expect(page.getByRole("link", { name: /\[1\] Cloud A/ })).toBeVisible();
    await expect(page.locator("#source-1").getByText("Cloud source excerpt.")).toBeVisible();
    await expect(page.locator("#source-1").getByText("[1]")).toBeVisible();
  });

  test("document scoped q&a exposes document scope and saved answers", async ({ page }) => {
    await page.goto("/documents/doc-1");
    await expect(page.getByRole("link", { name: "Ask about this document" })).toHaveAttribute("href", "/chat?document=doc-1");
    await expect(page.getByText("What does Cloud A say?").first()).toBeVisible();
    await page.goto("/chat?document=doc-1");
    await expect(page.getByText("scope Document: Cloud A")).toBeVisible();
    await expect(page.getByRole("button", { name: "Document" })).toBeVisible();
    await page.goto("/chat?topic=cloud");
    await expect(page.getByText("tag cloud")).toBeVisible();
  });
});
