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

  test("collection workspace connects scoped documents topics gaps and actions", async ({ page }) => {
    await page.goto("/collections/collection-1");
    await expect(page.getByRole("heading", { name: "Default" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Documents" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Knowledge gaps" })).toBeVisible();
    await expect(page.getByText("How does cloud storage work?")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ask", exact: true })).toHaveAttribute("href", "/chat?collection=collection-1");
    await expect(page.getByRole("link", { name: "Draft", exact: true })).toHaveAttribute("href", "/drafts?collection=collection-1");
  });

  test("processing center shows failed jobs and document timeline", async ({ page }) => {
    await page.goto("/processing");
    await expect(page.getByRole("heading", { name: "Processing center" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Failed PDF" })).toBeVisible();
    await expect(page.getByText("PDF extraction failed.").first()).toBeVisible();
    await expect(page.getByText("GitHub rate limit or access policy blocked this sync.").first()).toBeVisible();
    await page.getByRole("button", { name: /Exports/ }).click();
    await expect(page.getByText("Exports currently run synchronously.")).toBeVisible();
    await page.getByRole("button", { name: /Failed PDF/ }).click();
    await expect(page.getByText("Extracted")).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry failed job" })).toBeVisible();
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
    if (path === "/collections/collection-1/workspace") return json(route, collectionWorkspace());
    if (path === "/collections/collection-1/share") return json(route, null);
    if (path === "/topics") return json(route, topics());
    if (path === "/documents") return json(route, documents(url.searchParams.get("status")));
    if (path === "/documents/doc-1") return json(route, documentDetail("doc-1", "Cloud A"));
    if (path === "/documents/doc-1/status") return json(route, readyDocumentStatus("doc-1"));
    if (path === "/documents/doc-1/questions") return json(route, documentQuestionHistory());
    if (path === "/documents/doc-failed/status") return json(route, failedDocumentStatus());
    if (path === "/stats/overview") return json(route, statsOverview());
    if (path === "/stats/timeline") return json(route, statsTimeline());
    if (path === "/learning-goals/reminders") return json(route, []);
    if (path === "/repo-syncs") return json(route, repoSyncs());
    if (path === "/notes" && route.request().method() === "POST") return json(route, graphNote(), 201);
    if (path === "/notes") return json(route, { items: [graphNote()], total: 1, limit: 200, offset: 0 });
    if (path === "/notes/note-graph") return json(route, graphNote());
    if (path === "/notes/note-graph/versions") return json(route, []);
    if (path === "/chats") return json(route, chats());
    if (path === "/chats/chat-1") return json(route, chatDetail());
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

function collectionWorkspace() {
  return {
    collection: { id: "collection-1", user_id: "user-1", name: "Default", description: "Core workspace", color: null, created_at: "2026-05-20T00:00:00Z", updated_at: null },
    stats: { total_documents: 2, ready_documents: 2, processing_documents: 0, failed_documents: 0, topic_count: 1, recent_question_count: 1 },
    documents: [
      { id: "doc-1", title: "Cloud A", type: "TEXT", status: "READY", summary: "Cloud storage notes.", tags: ["cloud"], activity_temperature: "hot", created_at: "2026-05-20T00:00:00Z", updated_at: null },
    ],
    topics: [{ name: "cloud", document_count: 2, last_document_at: "2026-05-20T00:00:00Z" }],
    gaps: [{ title: "Thin evidence base", reason: "Add at least three ready sources for stronger synthesis.", severity: "low" }],
    recent_questions: [{ query_text: "How does cloud storage work?", answer_preview: "Cloud storage uses durable replicated systems.", result_count: 2, created_at: "2026-05-20T00:00:00Z" }],
  };
}

function topics() {
  return { items: [{ name: "cloud", document_count: 2, last_document_at: "2026-05-20T00:00:00Z" }] };
}

function documents(status: string | null) {
  const item = (id: string, title: string, itemStatus = "READY") => ({
    id,
    title,
    type: "TEXT",
    status: itemStatus,
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
  const items = [item("doc-1", "Cloud A"), item("doc-2", "Cloud B"), item("doc-failed", "Failed PDF", "FAILED")];
  const filtered = status ? items.filter((document) => document.status === status) : items;
  return { items: filtered, total: filtered.length, limit: 100, offset: 0 };
}

function documentDetail(id: string, title: string) {
  return {
    id,
    user_id: "user-1",
    collection_id: "collection-1",
    title,
    type: "TEXT",
    status: "READY",
    source_url: null,
    file_path: null,
    file_size_bytes: null,
    raw_content: "Cloud source excerpt with durable replication details.",
    summary: "Cloud storage notes.",
    word_count: 100,
    language: "en",
    entities: null,
    categories: null,
    visual_metadata: null,
    suggested_questions: ["What does Cloud A say?"],
    tags: ["cloud"],
    last_used_at: "2026-05-20T00:00:00Z",
    query_count: 1,
    citation_count: 1,
    activity_temperature: "hot",
    is_duplicate: false,
    duplicate_of_id: null,
    created_at: "2026-05-20T00:00:00Z",
    updated_at: null,
  };
}

function readyDocumentStatus(documentId: string) {
  return {
    document_id: documentId,
    status: "READY",
    progress: 100,
    message: "Ready",
    failure_reason: null,
    timeline: [
      { key: "uploaded", label: "Uploaded", threshold: 0, state: "complete", message: null },
      { key: "extracted", label: "Extracted", threshold: 40, state: "complete", message: null },
      { key: "embedded", label: "Embedded", threshold: 90, state: "complete", message: null },
      { key: "enriched", label: "Enriched", threshold: 95, state: "complete", message: null },
      { key: "ready", label: "Ready", threshold: 100, state: "complete", message: null },
    ],
  };
}

function documentQuestionHistory() {
  return {
    document_id: "doc-1",
    limit: 5,
    items: [
      {
        query_text: "What does Cloud A say?",
        answer_text: "Cloud answer [1].",
        result_count: 1,
        created_at: "2026-05-20T00:00:00Z",
      },
    ],
  };
}

function failedDocumentStatus() {
  return {
    document_id: "doc-failed",
    status: "FAILED",
    progress: 40,
    message: "Processing failed: PDF extraction failed.",
    failure_reason: "PDF extraction failed.",
    timeline: [
      { key: "uploaded", label: "Uploaded", threshold: 0, state: "complete", message: null },
      { key: "extracted", label: "Extracted", threshold: 40, state: "failed", message: "PDF extraction failed." },
      { key: "embedded", label: "Embedded", threshold: 90, state: "pending", message: null },
      { key: "enriched", label: "Enriched", threshold: 95, state: "pending", message: null },
      { key: "ready", label: "Ready", threshold: 100, state: "pending", message: null },
    ],
  };
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
        include_paths: ["README.md", "docs/**/*.md", "**/*.md"],
        exclude_paths: ["node_modules/**", ".git/**", "dist/**"],
        status: "failed",
        last_error: "GitHub rate limit or access policy blocked this sync.",
        last_synced_at: null,
        created_at: "2026-05-20T00:00:00Z",
        updated_at: null,
      },
    ],
  };
}

function chats() {
  return {
    items: [
      {
        id: "chat-1",
        user_id: "user-1",
        title: "Cloud Q&A",
        message_count: 2,
        created_at: "2026-05-20T00:00:00Z",
        updated_at: null,
      },
    ],
    total: 1,
    limit: 50,
    offset: 0,
  };
}

function chatDetail() {
  return {
    session: chats().items[0],
    messages: [
      {
        id: "message-1",
        chat_id: "chat-1",
        role: "user",
        content: "What does Cloud A say?",
        sources: null,
        refrag_context: null,
        eval_scores: null,
        trace_id: null,
        created_at: "2026-05-20T00:00:00Z",
      },
      {
        id: "message-2",
        chat_id: "chat-1",
        role: "assistant",
        content: "Cloud answer [1].",
        sources: [
          {
            chunk_id: "chunk-1",
            document_id: "doc-1",
            document_title: "Cloud A",
            content: "Cloud source excerpt.",
            page_number: null,
            chunk_index: 0,
            score: 0.9,
            citation: "[1]",
            used_in_answer: true,
          },
        ],
        refrag_context: null,
        eval_scores: null,
        trace_id: null,
        created_at: "2026-05-20T00:00:00Z",
      },
    ],
  };
}

function graph() {
  return {
    nodes: [
      { id: "topic-cloud", kind: "topic", label: "Cloud", detail: "Cloud topic" },
      {
        id: "doc-1",
        kind: "document",
        label: "Cloud A",
        detail: "TEXT",
        collection_id: "collection-1",
        summary: "Cloud storage notes.",
        suggested_questions: ["What does Cloud A say?"],
        created_at: "2026-05-20T00:00:00Z",
        updated_at: null,
      },
      { id: "doc-2", kind: "document", label: "Cloud B", detail: "TEXT" },
    ],
    edges: [
      { id: "edge-1", source_id: "topic-cloud", target_id: "doc-1", relation_type: "topic_document", label: "same_topic", score: 0.9 },
      { id: "edge-2", source_id: "topic-cloud", target_id: "doc-2", relation_type: "topic_document", label: "same_topic", score: 0.7 },
    ],
  };
}

function graphNote() {
  return {
    id: "note-graph",
    user_id: "user-1",
    collection_id: "collection-1",
    title: "Graph: Cloud A",
    content: "# Cloud A",
    language: null,
    version: 1,
    status: "READY",
    created_at: "2026-05-20T00:00:00Z",
    updated_at: null,
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
