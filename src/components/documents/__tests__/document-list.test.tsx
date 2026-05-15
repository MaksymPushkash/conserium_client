import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DocumentList } from "@/components/documents/document-list";
import type { DocumentListItem } from "@/lib/types";

function documentItem(overrides: Partial<DocumentListItem> = {}): DocumentListItem {
  return {
    id: "doc-1",
    user_id: "user-1",
    collection_id: null,
    title: "Async Python",
    type: "URL",
    status: "READY",
    source_url: "https://example.com",
    file_path: null,
    file_size_bytes: null,
    summary: "Async Python overlaps I/O work with coroutines and an event loop.",
    word_count: 1200,
    language: "en",
    suggested_questions: [],
    tags: ["python"],
    is_duplicate: false,
    duplicate_of_id: null,
    created_at: "2026-05-15T00:00:00Z",
    updated_at: null,
    ...overrides,
  };
}

describe("DocumentList", () => {
  it("renders document summaries in the library list", () => {
    render(
      <DocumentList
        documents={[documentItem()]}
        selectedIds={new Set()}
        onToggleSelected={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Async Python")).toBeInTheDocument();
    expect(screen.getByText("Async Python overlaps I/O work with coroutines and an event loop.")).toBeInTheDocument();
  });
});
