import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useChatSuggestions } from "@/hooks/use-chat-suggestions";
import type { Collection, DocumentListItem } from "@/lib/types";

const collection: Collection = {
  id: "collection-1",
  user_id: "user-1",
  name: "Research",
  description: null,
  color: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
};

const document: DocumentListItem = {
  id: "doc-1",
  user_id: "user-1",
  collection_id: "collection-1",
  title: "Architecture notes",
  type: "TEXT",
  status: "READY",
  source_url: null,
  file_path: null,
  file_size_bytes: null,
  summary: null,
  word_count: 10,
  language: "en",
  suggested_questions: ["What is dependency direction?"],
  tags: ["architecture"],
  is_duplicate: false,
  duplicate_of_id: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
};

describe("useChatSuggestions", () => {
  it("builds collection, generated-question, title, and tag suggestions", () => {
    const { result } = renderHook(() => useChatSuggestions([collection], [document]));

    expect(result.current.hasReadyDocuments).toBe(true);
    expect(result.current.availableTags).toEqual(["architecture"]);
    expect(result.current.suggestionChips).toEqual(expect.arrayContaining([
      "What is in Research?",
      "What is dependency direction?",
      "Summarize Architecture notes",
      "Find architecture references",
    ]));
  });
});
