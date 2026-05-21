import { expect, type Page, type Route, test } from "@playwright/test";

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

    await page.getByRole("button", { name: /Flag a concern/i }).click();
    await page.getByPlaceholder("What looks stale, weak, duplicated, or misleading?").fill("Needs review");
    await page.getByRole("button", { name: "Save concern" }).click();
    await expect(page.getByText("Concern saved for review.")).toBeVisible();
  });

  test("drafts and compare show insufficient-context errors without real backend", async ({ page }) => {
    await page.goto("/drafts");
    await page.getByPlaceholder("Write an article about Python generators").fill("Write about cloud architecture");
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
    await page.goto("/repo-syncs");
    await expect(page.getByText("Needs attention")).toBeVisible();
    await expect(page.getByText("GitHub rate limit or access policy blocked this sync.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Retry/i })).toBeVisible();

    await page.goto("/collections");
    await expect(page.getByRole("button", { name: "Programming" })).toBeVisible();
    await page.getByRole("button", { name: "Research" }).click();
    await expect(page.getByPlaceholder("Programming")).toHaveValue("Research");
  });
});

async function signIn(page: Page) {
  await page.goto("/auth");
  await page.getByPlaceholder("Email").fill("max@example.com");
  await page.getByPlaceholder("Password").fill("password");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/dashboard/);
}

async function mockApi(page: Page) {
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace("/api/v1", "");
    if (path === "/auth/login") return json(route, { access_token: "test-token" });
    if (path === "/auth/refresh") return json(route, { access_token: "test-token" });
    if (path === "/users/me") return json(route, user());
    if (path === "/users/preferences") return json(route, preferences());
    if (path === "/collections") return json(route, collections());
    if (path === "/topics") return json(route, topics());
    if (path === "/documents") return json(route, documents());
    if (path === "/stats/overview") return json(route, statsOverview());
    if (path === "/stats/timeline") return json(route, statsTimeline());
    if (path === "/learning-goals/reminders") return json(route, []);
    if (path === "/repo-syncs") return json(route, repoSyncs());
    if (path === "/knowledge-graph") return json(route, graph());
    if (path === "/knowledge-graph/concerns") return json(route, concern(), 201);
    if (path === "/integrations/notion") return json(route, { connected: false });
    if (path === "/drafts/generate") return json(route, { detail: "Saved context is insufficient for this draft." }, 422);
    if (path === "/compare/documents") {
      return json(route, { detail: "The provided context does not contain enough relevant information to answer this question." }, 422);
    }
    return json(route, {});
  });
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

function user() {
  return {
    id: "user-1",
    email: "max@example.com",
    display_name: "maxpuh",
    is_active: true,
    preferences: {},
    created_at: "2026-05-20T00:00:00Z",
    updated_at: null,
  };
}

function preferences() {
  return {
    appearance: { theme: "dark" },
    privacy: { share_usage_data: false, retain_query_history: true },
    ai: { answer_language: "match_question", retrieval_depth: "balanced" },
  };
}

function collections() {
  return { items: [{ id: "collection-1", name: "Default", description: null, color: null, document_count: 2, created_at: "2026-05-20T00:00:00Z", updated_at: null }], total: 1 };
}

function topics() {
  return { items: [{ name: "cloud", document_count: 2, last_document_at: "2026-05-20T00:00:00Z" }] };
}

function documents() {
  const item = (id: string, title: string) => ({
    id,
    title,
    type: "TEXT",
    status: "READY",
    source_url: null,
    file_size_bytes: null,
    summary: null,
    word_count: 100,
    language: "en",
    tags: [],
    collection_id: "collection-1",
    created_at: "2026-05-20T00:00:00Z",
    updated_at: null,
  });
  return { items: [item("doc-1", "Cloud A"), item("doc-2", "Cloud B")], total: 2, limit: 100, offset: 0 };
}

function statsOverview() {
  return {
    total_documents: 2,
    ready_documents: 2,
    processing_documents: 0,
    failed_documents: 0,
    hot_documents: 1,
    cold_documents: 1,
    forgotten_documents: 0,
    active_documents: 2,
    query_count: 3,
    citation_count: 4,
  };
}

function statsTimeline() {
  return { items: [{ month: "2026-05", saved_documents: 2, active_documents: 1, query_count: 3 }], months: 6 };
}

function repoSyncs() {
  return {
    items: [
      {
        id: "sync-1",
        collection_id: "collection-1",
        provider: "github",
        owner: "example",
        repo: "docs",
        branch: "main",
        status: "failed",
        last_error: "GitHub rate limit or access policy blocked this sync.",
        last_synced_at: null,
        created_at: "2026-05-20T00:00:00Z",
        updated_at: null,
      },
    ],
  };
}

function graph() {
  return {
    nodes: [
      { id: "topic-cloud", kind: "topic", label: "Cloud", detail: "Cloud topic" },
      { id: "doc-1", kind: "document", label: "Cloud A", detail: "TEXT" },
      { id: "doc-2", kind: "document", label: "Cloud B", detail: "TEXT" },
    ],
    edges: [
      { id: "edge-1", source_id: "topic-cloud", target_id: "doc-1", relation_type: "topic_document", label: "same_topic", score: 0.9 },
      { id: "edge-2", source_id: "topic-cloud", target_id: "doc-2", relation_type: "topic_document", label: "same_topic", score: 0.7 },
    ],
  };
}

function concern() {
  return {
    id: "concern-1",
    node_id: "topic-cloud",
    node_kind: "topic",
    node_label: "Cloud",
    message: "Needs review",
    status: "open",
    created_at: "2026-05-20T00:00:00Z",
  };
}
