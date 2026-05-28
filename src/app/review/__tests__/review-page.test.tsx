import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ReviewPage from "@/app/review/page";
import { generateFlashcards, listDocuments, listDueFlashcards, reviewFlashcard } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  generateFlashcards: vi.fn(),
  listDocuments: vi.fn(),
  listDueFlashcards: vi.fn(),
  reviewFlashcard: vi.fn(),
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ReviewPage />
    </QueryClientProvider>,
  );
}

describe("ReviewPage", () => {
  it("reveals and grades a due flashcard", async () => {
    vi.mocked(listDueFlashcards).mockResolvedValue({
      total: 1,
      limit: 20,
      items: [
        {
          id: "card-1",
          user_id: "user-1",
          scope_type: "document",
          collection_id: null,
          topic: null,
          source_document_id: "doc-1",
          source_chunk_id: null,
          question: "What is asyncio?",
          answer: "Asyncio runs cooperative I/O.",
          citation_metadata: {},
          due_at: "2026-05-26T00:00:00Z",
          interval_days: 0,
          ease_factor: 2.5,
          review_count: 0,
          source_title: "Asyncio notes",
          created_at: "2026-05-26T00:00:00Z",
          updated_at: null,
        },
      ],
    });
    vi.mocked(listDocuments).mockResolvedValue({ items: [], total: 0, limit: 100, offset: 0 });
    vi.mocked(reviewFlashcard).mockResolvedValue({} as Awaited<ReturnType<typeof reviewFlashcard>>);

    renderPage();

    expect(await screen.findByText("What is asyncio?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Reveal answer/i }));
    expect(screen.getByText("Asyncio runs cooperative I/O.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Good/i }));

    await waitFor(() => expect(reviewFlashcard).toHaveBeenCalledWith("card-1", "good"));
  });

  it("generates flashcards from selected source scope", async () => {
    vi.mocked(listDueFlashcards).mockResolvedValue({ total: 0, limit: 20, items: [] });
    vi.mocked(listDocuments).mockResolvedValue({
      total: 1,
      limit: 100,
      offset: 0,
      items: [
        {
          id: "doc-1",
          user_id: "user-1",
          collection_id: null,
          title: "Asyncio notes",
          type: "TEXT",
          status: "READY",
          source_url: null,
          file_path: null,
          file_size_bytes: null,
          summary: "Asyncio summary",
          word_count: 20,
          language: "en",
          suggested_questions: [],
          tags: [],
          last_used_at: null,
          query_count: 0,
          citation_count: 0,
          activity_temperature: "hot",
          is_duplicate: false,
          duplicate_of_id: null,
          created_at: "2026-05-26T00:00:00Z",
          updated_at: null,
        },
      ],
    });
    vi.mocked(generateFlashcards).mockResolvedValue({ items: [], created_count: 2 });

    renderPage();

    await screen.findByText("Asyncio notes");
    fireEvent.change(await screen.findByRole("combobox"), { target: { value: "doc-1" } });
    fireEvent.click(screen.getByRole("button", { name: /Generate flashcards/i }));

    await waitFor(() => expect(generateFlashcards).toHaveBeenCalledWith({ document_id: "doc-1", limit: 6 }));
  });
});
