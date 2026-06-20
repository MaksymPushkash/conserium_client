import { expect, type Page, type Route } from "@playwright/test";

export async function signIn(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "conserium-session",
      JSON.stringify({ state: { accessToken: "test-token" }, version: 0 }),
    );
  });
  await expect(async () => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole("heading", { name: "Knowledge workspace" })).toBeVisible({ timeout: 3_000 });
  }).toPass({ timeout: 15_000 });
}

export async function mockApi(page: Page, options: { theme?: "dark" | "light" } = {}) {
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace("/api/v1", "");
    if (path === "/auth/login") return json(route, { access_token: "test-token" });
    if (path === "/auth/refresh") return json(route, { access_token: "test-token" });
    if (path === "/users/me") return json(route, user());
    if (path === "/users/preferences") return json(route, preferences(options.theme ?? "dark"));
    if (path === "/collections") return json(route, collections());
    if (path === "/workspaces") return json(route, workspaces());
    if (path === "/workspaces/workspace-1" && request.method() === "PATCH") return json(route, updatedWorkspace());
    if (path === "/workspaces/workspace-1" && request.method() === "DELETE") return json(route, null, 204);
    if (path === "/workspaces/workspace-1/members") return json(route, workspaceMembers());
    if (path === "/workspaces/workspace-1/transfer-ownership") return json(route, transferredWorkspace());
    if (path === "/workspaces/workspace-1/audit") return json(route, workspaceAudit());
    if (path === "/public/collections/public-cloud") return json(route, publicCollection());
    if (path === "/public/collections/public-cloud/query") return json(route, publicCollectionQuery());
    if (path === "/public/answers/share-cloud") return json(route, publicAnswerShare());
    if (path === "/collections/collection-1/workspace") return json(route, collectionWorkspace());
    if (path === "/collections/collection-1/share") return json(route, null);
    if (path === "/topics") return json(route, topics());
    if (path === "/knowledge-gaps") return json(route, knowledgeGapList());
    if (path === "/knowledge-gaps/cloud") return json(route, knowledgeGapDetail());
    if (path === "/documents") return json(route, documents(url.searchParams.get("status")));
    if (path === "/documents/doc-1") return json(route, documentDetail("doc-1", "Cloud A"));
    if (path === "/documents/doc-1/status") return json(route, readyDocumentStatus("doc-1"));
    if (path === "/documents/doc-1/questions") return json(route, documentQuestionHistory());
    if (path === "/documents/doc-failed/status") return json(route, failedDocumentStatus());
    if (path === "/review/flashcards/due") return json(route, { items: [], total: 0, limit: 20 });
    if (path === "/review/quizzes/history") return json(route, quizHistory());
    if (path === "/review/quizzes/attempts") return json(route, quizAttempts());
    if (path === "/review/quizzes/weak-areas") return json(route, quizWeakAreas());
    if (path === "/review/quizzes/generate") return json(route, quiz(), 201);
    if (path === "/review/quizzes/quiz-1/submit") return json(route, quizAttempt());
    if (path === "/review/learning-paths") return json(route, learningPaths());
    if (path === "/review/learning-paths/generate") return json(route, learningPath(), 201);
    if (path === "/review/learning-paths/path-1/steps/step-1") return json(route, learningPath("done"));
    if (path === "/review/learning-paths/path-1/regenerate") return json(route, learningPath(), 201);
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
    if (path === "/knowledge-graph/insights") return json(route, graphInsights());
    if (path === "/knowledge-graph") return json(route, graph());
    if (path === "/knowledge-graph/concerns") return json(route, concern(), 201);
    if (path === "/integrations/notion") return json(route, { connected: false });
    if (path === "/answer-shares") return json(route, answerShares());
    if (path === "/answer-shares/share-cloud" && request.method() === "DELETE") return json(route, null, 204);
    if (path === "/api-keys") {
      if (request.method() === "POST") return json(route, createdApiKey(), 201);
      return json(route, apiKeys());
    }
    if (path === "/drafts") return json(route, draftList());
    if (path === "/drafts/templates") return json(route, draftTemplates());
    if (path === "/drafts/outline") return json(route, draftOutline());
    if (path === "/drafts/draft-1") return json(route, draftDetail());
    if (path === "/drafts/draft-1/versions") return json(route, draftVersions());
    if (path === "/drafts/draft-1/versions/version-0/restore") return json(route, draftDetail());
    if (path === "/drafts/generate") return json(route, { detail: "Saved context is insufficient for this draft." }, 422);
    if (path === "/compare/results") return json(route, { items: [comparisonResult()], total: 1 });
    if (path === "/compare/results/compare-1") return json(route, comparisonResult());
    if (path === "/compare/documents") {
      return json(route, { detail: "The provided context does not contain enough relevant information to answer this question." }, 422);
    }
    return json(route, {});
  });
}

export function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}


function publicCollection() {
  return {
    id: "collection-public",
    name: "Public Cloud Notes",
    description: "Shared notes about durable cloud storage.",
    color: null,
    documents: [
      {
        id: "public-doc-1",
        title: "Cloud Storage Primer",
        type: "TEXT",
        status: "READY",
        source_url: "https://example.com/cloud-storage",
        summary: "Cloud storage keeps data durable through replication and recovery workflows.",
        word_count: 640,
        language: "en",
        tags: ["cloud", "storage"],
        created_at: "2026-05-20T00:00:00Z",
        updated_at: null,
        archived_at: null,
      },
    ],
    created_at: "2026-05-20T00:00:00Z",
    updated_at: null,
  };
}

function publicCollectionQuery() {
  return {
    query: "How is cloud storage durable?",
    answer: "Cloud storage is durable because data is replicated and recovery workflows validate copies [1].",
    sources: [
      {
        document_title: "Cloud Storage Primer",
        content: "Cloud storage keeps data durable through replication and recovery workflows.",
        page_number: null,
        chunk_index: 0,
        citation: "[1]",
        used_in_answer: true,
      },
    ],
    suggested_follow_up_questions: ["What can fail in replication?"],
    share: publicAnswerShare(),
  };
}

function publicAnswerShare() {
  return {
    slug: "share-cloud",
    url_path: "/public/answers/share-cloud",
    query: "How is cloud storage durable?",
    answer: "Cloud storage is durable because data is replicated and recovery workflows validate copies [1].",
    sources: [
      {
        document_title: "Cloud Storage Primer",
        content: "Cloud storage keeps data durable through replication and recovery workflows.",
        page_number: null,
        chunk_index: 0,
        citation: "[1]",
        used_in_answer: true,
      },
    ],
    public_collection_slug: "public-cloud",
    created_at: "2026-05-20T00:00:00Z",
  };
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

function preferences(theme: "dark" | "light") {
  return {
    appearance: { theme },
    privacy: { share_usage_data: false, retain_query_history: true },
    ai: { answer_language: "match_question", retrieval_depth: "balanced" },
  };
}

function apiKeys() {
  return {
    items: [
      {
        id: "api-key-1",
        name: "Browser extension",
        prefix: "con_test_123",
        scopes: ["ingest:write"],
        last_used_at: null,
        revoked_at: null,
        created_at: "2026-05-20T00:00:00Z",
      },
    ],
  };
}

function answerShares() {
  return {
    items: [
      {
        slug: "share-cloud",
        url_path: "/public/answers/share-cloud",
        query: "How is cloud storage durable?",
        answer: "Cloud storage is durable because data is replicated.",
        sources: [
          {
            chunk_id: "chunk-1",
            document_id: "doc-1",
            document_title: "Cloud Storage Primer",
            content: "Cloud storage keeps data durable through replication.",
            page_number: null,
            chunk_index: 0,
            citation: "[1]",
            used_in_answer: true,
          },
        ],
        public_collection_slug: "public-cloud",
        collection_id: "collection-1",
        collection_name: "Default",
        revoked_at: null,
        created_at: "2026-05-20T00:00:00Z",
      },
      {
        slug: "share-revoked",
        url_path: "/public/answers/share-revoked",
        query: "What failed?",
        answer: "The link was revoked.",
        sources: [],
        public_collection_slug: null,
        collection_id: null,
        collection_name: null,
        revoked_at: "2026-05-21T00:00:00Z",
        created_at: "2026-05-19T00:00:00Z",
      },
    ],
  };
}

function createdApiKey() {
  return {
    api_key: apiKeys().items[0],
    token: "con_test_123_plaintext",
  };
}

function collections() {
  return {
    items: [
      {
        id: "collection-1",
        user_id: "user-1",
        workspace_id: "workspace-1",
        access_role: "owner",
        name: "Default",
        description: null,
        color: null,
        document_count: 2,
        created_at: "2026-05-20T00:00:00Z",
        updated_at: null,
      },
    ],
    total: 1,
    limit: 100,
    offset: 0,
  };
}

function workspaces() {
  return {
    items: [
      {
        id: "workspace-1",
        user_id: "user-1",
        name: "Core team",
        description: "Shared research workspace",
        access_role: "owner",
        created_at: "2026-05-20T00:00:00Z",
        updated_at: null,
        archived_at: null,
      },
    ],
    total: 1,
    limit: 100,
    offset: 0,
  };
}


function transferredWorkspace() {
  return {
    id: "workspace-1",
    user_id: "user-2",
    name: "Core team",
    description: "Shared research workspace",
    access_role: "owner",
    created_at: "2026-05-20T00:00:00Z",
    updated_at: "2026-06-03T00:00:00Z",
    archived_at: null,
  };
}

function updatedWorkspace() {
  return {
    ...workspaces().items[0],
    name: "Core team updated",
    description: "Updated team workspace",
    updated_at: "2026-06-03T00:00:00Z",
    archived_at: null,
  };
}

function workspaceMembers() {
  return {
    items: [
      {
        id: "workspace-member-1",
        workspace_id: "workspace-1",
        user_id: "user-2",
        email: "editor@example.com",
        role: "editor",
        invite_status: "active",
        invited_by_user_id: "user-1",
        created_at: "2026-05-21T00:00:00Z",
        updated_at: null,
      },
      {
        id: "workspace-member-2",
        workspace_id: "workspace-1",
        user_id: null,
        email: "viewer@example.com",
        role: "viewer",
        invite_status: "pending",
        invited_by_user_id: "user-1",
        created_at: "2026-05-22T00:00:00Z",
        updated_at: null,
      },
    ],
  };
}

function workspaceAudit() {
  return {
    items: [
      {
        id: "workspace-audit-1",
        workspace_id: "workspace-1",
        actor_user_id: "user-1",
        event_type: "member_invited",
        metadata: { email: "editor@example.com", role: "editor" },
        created_at: "2026-05-21T00:00:00Z",
      },
    ],
    total: 1,
    limit: 50,
    offset: 0,
  };
}

function collectionWorkspace() {
  return {
    collection: { id: "collection-1", user_id: "user-1", workspace_id: "workspace-1", access_role: "owner", name: "Default", description: "Core workspace", color: null, created_at: "2026-05-20T00:00:00Z", updated_at: null },
    stats: { total_documents: 2, ready_documents: 2, processing_documents: 0, failed_documents: 0, topic_count: 1, recent_question_count: 1 },
    documents: [
      { id: "doc-1", title: "Cloud A", type: "TEXT", status: "READY", summary: "Cloud storage notes.", tags: ["cloud"], activity_temperature: "hot", created_at: "2026-05-20T00:00:00Z", updated_at: null },
    ],
    topics: [{ name: "cloud", document_count: 2, last_document_at: "2026-05-20T00:00:00Z" }],
    gaps: [
      {
        id: "cloud--summary",
        topic: "cloud",
        title: "cloud coverage",
        reason: "1 rubric area(s) are missing; current coverage is 50%.",
        severity: "medium",
        coverage_ratio: 0.5,
        missing_source_types: ["reference"],
        suggested_actions: ["Add a cloud reference."],
      },
    ],
    recent_questions: [{ query_text: "How does cloud storage work?", answer_preview: "Cloud storage uses durable replicated systems.", result_count: 2, created_at: "2026-05-20T00:00:00Z" }],
    recent_drafts: [
      {
        id: "draft-1",
        title: "Brief: cloud architecture",
        prompt: "Write about cloud architecture",
        template_id: "brief",
        scope_type: "collection",
        topic: "cloud",
        knowledge_gap_id: "cloud--summary",
        version_number: 1,
        created_at: "2026-05-20T00:00:00Z",
        updated_at: null,
      },
    ],
    recent_comparisons: [
      {
        id: "compare-1",
        left_title: "Cloud A",
        right_title: "Cloud B",
        summary: "Cloud A vs Cloud B across claims and architecture.",
        dimensions: ["claims", "architecture"],
        created_at: "2026-05-20T00:00:00Z",
      },
    ],
  };
}

export function comparisonResult() {
  return {
    id: "compare-1",
    collection_id: "collection-1",
    left_document_id: "doc-1",
    right_document_id: "doc-2",
    left_title: "Cloud A",
    right_title: "Cloud B",
    dimensions: ["claims", "architecture"],
    markdown: "## Summary\n\nCloud A and Cloud B both discuss durable storage [1].",
    summary: "Cloud A vs Cloud B across claims and architecture.",
    evidence_rows: [
      {
        dimension: "claims",
        left_evidence: "[1] Cloud A claims durable replication.",
        right_evidence: "[2] Cloud B claims regional durability.",
        assessment: "Claims comparison is grounded in [1] and [2].",
        left_source_id: "chunk-1",
        right_source_id: "chunk-2",
        left_citation: "[1]",
        right_citation: "[2]",
        grounding_type: "structured",
      },
      {
        dimension: "architecture",
        left_evidence: "[1] Cloud A uses replicated storage.",
        right_evidence: "[2] Cloud B uses regional buckets.",
        assessment: "Architecture comparison is grounded in [1] and [2].",
        left_source_id: "chunk-1",
        right_source_id: "chunk-2",
        left_citation: "[1]",
        right_citation: "[2]",
        grounding_type: "structured",
      },
    ],
    sources: [
      {
        chunk_id: "chunk-1",
        document_id: "doc-1",
        document_title: "Cloud A",
        content: "Cloud A claims durable replication.",
        page_number: null,
        chunk_index: 0,
        score: 1,
        citation: "[1]",
        used_in_answer: true,
      },
      {
        chunk_id: "chunk-2",
        document_id: "doc-2",
        document_title: "Cloud B",
        content: "Cloud B claims regional durability.",
        page_number: null,
        chunk_index: 0,
        score: 1,
        citation: "[2]",
        used_in_answer: true,
      },
    ],
    created_at: "2026-05-20T00:00:00Z",
  };
}

function topics() {
  return { items: [{ name: "cloud", document_count: 2, last_document_at: "2026-05-20T00:00:00Z", source_names: ["cloud"], pinned: false, ignored: false }] };
}

function draftTemplates() {
  return {
    items: [
      {
        id: "brief",
        name: "Brief",
        description: "Concise cited summary.",
        prompt: "Write a concise brief.",
        outline: ["Context", "Key points", "Risks", "Next actions"],
      },
      {
        id: "implementation_plan",
        name: "Implementation plan",
        description: "Ordered engineering plan.",
        prompt: "Write an implementation plan.",
        outline: ["Objective", "Phases", "Tasks", "Validation"],
      },
    ],
  };
}

function draftOutline() {
  return {
    prompt: "Write about cloud architecture",
    template_id: "brief",
    scope_type: "all",
    title: "Brief: cloud architecture",
    sections: ["Context", "Evidence", "Risks"],
  };
}

function draftList() {
  return {
    items: [
      {
        id: "draft-1",
        collection_id: "collection-1",
        title: "Brief: cloud architecture",
        prompt: "Write about cloud architecture",
        template_id: "brief",
        scope_type: "collection",
        topic: "cloud",
        knowledge_gap_id: "cloud--summary",
        version_number: 1,
        created_at: "2026-05-20T00:00:00Z",
        updated_at: null,
      },
    ],
    total: 1,
  };
}

export function draftDetail() {
  return {
    id: "draft-1",
    collection_id: "collection-1",
    current_version_id: "version-1",
    title: "Brief: cloud architecture",
    prompt: "Write about cloud architecture",
    template_id: "brief",
    scope_type: "collection",
    topic: "cloud",
    knowledge_gap_id: "cloud--summary",
    scope_metadata: {},
    markdown: "# Cloud architecture\n\nSaved draft [1].",
    sources: [],
    gaps: [],
    version_number: 1,
    created_at: "2026-05-20T00:00:00Z",
    updated_at: null,
  };
}

function draftVersions() {
  return {
    items: [
      {
        id: "version-0",
        draft_id: "draft-1",
        version_number: 1,
        title: "Brief: cloud architecture",
        prompt: "Write about cloud architecture",
        template_id: "brief",
        scope_type: "collection",
        collection_id: "collection-1",
        topic: "cloud",
        knowledge_gap_id: "cloud--summary",
        markdown: "# Cloud architecture\n\nSaved draft [1].",
        sources: [],
        gaps: [],
        created_at: "2026-05-20T00:00:00Z",
      },
    ],
  };
}

function knowledgeGapList() {
  return { items: [knowledgeGapDetail()], total: 1 };
}

function knowledgeGapDetail() {
  return {
    id: "cloud--summary",
    topic: "cloud",
    collection_id: null,
    covered_count: 1,
    missing_count: 1,
    coverage_ratio: 0.5,
    why_detected: "1 rubric area(s) are missing; current coverage is 50%.",
    missing_source_types: ["reference"],
    severity: "medium",
    rationale: "Testing coverage is weak.",
    suggested_actions: ["Add a testing reference."],
    areas: [
      {
        id: "cloud--testing",
        name: "Testing",
        covered: false,
        evidence_count: 0,
        evidence_titles: [],
        why_detected: "No saved source matched Testing.",
        missing_source_types: ["reference"],
        severity: "medium",
        rationale: "Testing is missing.",
        suggested_actions: ["Create a testing note."],
      },
    ],
  };
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

export function documentDetail(id: string, title: string) {
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

export function repoSyncs() {
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
      { id: "topic-cloud", kind: "topic", label: "Cloud", detail: "Cloud topic", source_names: ["Cloud", "storage"], is_pinned: false, is_ignored: false },
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

function graphInsights() {
  return {
    items: [
      {
        kind: "pinned_topics",
        title: "Pinned topics",
        description: "Topics manually marked as important.",
        severity: "info",
        count: 0,
        nodes: [],
      },
      {
        kind: "thin_clusters",
        title: "Thin clusters",
        description: "Topics backed by only one visible document.",
        severity: "low",
        count: 1,
        nodes: [{ id: "topic-cloud", kind: "topic", label: "Cloud", source_names: ["Cloud"], is_pinned: false, is_ignored: false }],
      },
    ],
  };
}

export function graphNote() {
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

export function quizHistory() {
  return {
    items: [quiz()],
    total: 1,
    limit: 8,
  };
}

export function quizAttempts() {
  return {
    items: [
      {
        id: "attempt-1",
        quiz_id: "quiz-1",
        user_id: "user-1",
        answers: [{ question_id: "q1", option_id: "a" }],
        score: 0,
        total: 1,
        weak_areas: ["Cloud durability"],
        quiz_title: "Quiz: Cloud A",
        created_at: "2026-05-20T00:00:00Z",
      },
    ],
    total: 1,
    limit: 8,
  };
}

export function quizWeakAreas() {
  return {
    items: [{ name: "Cloud durability", count: 2, last_seen_at: "2026-05-20T00:00:00Z" }],
    total: 1,
    limit: 8,
  };
}

export function quiz() {
  return {
    id: "quiz-1",
    user_id: "user-1",
    scope_type: "document",
    collection_id: null,
    topic: null,
    source_document_id: "doc-1",
    title: "Quiz: Cloud A",
    source_title: "Cloud A",
    questions: [
      {
        id: "q1",
        question: "What keeps cloud storage durable?",
        options: [
          { id: "a", text: "Replication" },
          { id: "b", text: "Manual copies" },
        ],
        correct_option_id: "a",
        area: "Cloud durability",
      },
    ],
    created_at: "2026-05-20T00:00:00Z",
    updated_at: null,
  };
}

export function quizAttempt() {
  return {
    id: "attempt-2",
    quiz_id: "quiz-1",
    user_id: "user-1",
    answers: [{ question_id: "q1", option_id: "a" }],
    score: 1,
    total: 1,
    weak_areas: [],
    quiz_title: "Quiz: Cloud A",
    created_at: "2026-05-21T00:00:00Z",
  };
}

export function learningPath(status: "todo" | "done" = "todo") {
  return {
    id: "path-1",
    user_id: "user-1",
    scope_type: "document",
    collection_id: null,
    topic: null,
    source_document_id: "doc-1",
    title: "Learning path: Cloud A",
    steps: [
      {
        id: "step-1",
        title: "Cloud A",
        focus: "cloud",
        summary: "Review durability and replication details.",
        source_document_id: "doc-1",
        status,
      },
    ],
    created_at: "2026-05-20T00:00:00Z",
    updated_at: null,
  };
}

export function learningPaths(status: "todo" | "done" = "todo") {
  return {
    items: [learningPath(status)],
    total: 1,
    limit: 6,
  };
}
