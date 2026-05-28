import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RelatedDocumentsCard } from "@/components/documents/related-documents-card";
import type { DocumentConnection, DocumentListItem } from "@/lib/types";

function documentItem(overrides: Partial<DocumentListItem> = {}): DocumentListItem {
  return {
    id: "related-1",
    user_id: "user-1",
    collection_id: null,
    title: "Async Python",
    type: "URL",
    status: "READY",
    source_url: "https://example.com",
    file_path: null,
    file_size_bytes: null,
    summary: "Async Python overlaps I/O work with coroutines.",
    word_count: 1200,
    language: "en",
    suggested_questions: [],
    tags: ["python"],
    last_used_at: "2026-05-15T00:00:00Z",
    query_count: 0,
    citation_count: 0,
    activity_temperature: "hot",
    is_duplicate: false,
    duplicate_of_id: null,
    created_at: "2026-05-15T00:00:00Z",
    updated_at: null,
    ...overrides,
  };
}

describe("RelatedDocumentsCard", () => {
  it("renders reasons and scoped actions", () => {
    const item: DocumentConnection = {
      document: documentItem(),
      reasons: ["Shared tags: python", "Same collection"],
      relationship_score: 5,
    };

    render(<RelatedDocumentsCard currentDocumentId="current-1" items={[item]} />);

    expect(screen.getByText("Async Python")).toBeInTheDocument();
    expect(screen.getByText("Shared tags: python")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ask/i })).toHaveAttribute("href", "/chat?document=related-1");
    expect(screen.getByRole("link", { name: /Compare/i })).toHaveAttribute("href", "/compare?left=current-1&right=related-1");
  });
});
