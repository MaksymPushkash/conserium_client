"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpenCheck, Eye, Loader2, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { MetricCard, PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { generateFlashcards, listDocuments, listDueFlashcards, reviewFlashcard } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import type { Flashcard, FlashcardGrade } from "@/lib/types";

const grades: Array<{ id: FlashcardGrade; label: string; detail: string }> = [
  { id: "again", label: "Again", detail: "1 day" },
  { id: "hard", label: "Hard", detail: "short" },
  { id: "good", label: "Good", detail: "normal" },
  { id: "easy", label: "Easy", detail: "long" },
];

export default function ReviewPage() {
  const queryClient = useQueryClient();
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const dueQuery = useQuery({ queryKey: ["review", "due"], queryFn: () => listDueFlashcards(20) });
  const documentsQuery = useQuery({ queryKey: ["documents", "review"], queryFn: () => listDocuments({ limit: 100, status: "READY" }) });
  const dueCards = dueQuery.data?.items ?? [];
  const activeCard = dueCards[0] ?? null;
  const generateMutation = useMutation({
    mutationFn: () => generateFlashcards({ document_id: selectedDocumentId || null, limit: 6 }),
    onSuccess: async () => {
      setRevealedId(null);
      await queryClient.invalidateQueries({ queryKey: ["review", "due"] });
    },
  });
  const reviewMutation = useMutation({
    mutationFn: ({ id, grade }: { id: string; grade: FlashcardGrade }) => reviewFlashcard(id, grade),
    onSuccess: async () => {
      setRevealedId(null);
      await queryClient.invalidateQueries({ queryKey: ["review", "due"] });
    },
  });

  return (
    <PageShell className="max-w-7xl space-y-5">
      <PageHeader
        eyebrow="Learning"
        title="Review"
        description="Review due flashcards generated from saved Conserium sources."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Due cards" value={dueQuery.data?.total ?? "..."} detail="Ready for review" icon={<BookOpenCheck className="h-4 w-4" />} />
        <MetricCard label="Loaded" value={dueCards.length} detail="Cards in this session" icon={<Eye className="h-4 w-4" />} />
        <MetricCard label="Ready documents" value={documentsQuery.data?.items.length ?? "..."} detail="Available for generation" icon={<Sparkles className="h-4 w-4" />} />
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <SectionPanel title="Review card" description="Reveal the answer, grade recall, then Conserium schedules the next review.">
          {dueQuery.error ? <div className="text-sm text-red-300">{errorMessage(dueQuery.error)}</div> : null}
          {activeCard ? (
            <ReviewCard
              card={activeCard}
              revealed={revealedId === activeCard.id}
              pending={reviewMutation.isPending}
              onReveal={() => setRevealedId(activeCard.id)}
              onReview={(grade) => reviewMutation.mutate({ id: activeCard.id, grade })}
            />
          ) : null}
          {!dueQuery.isLoading && !activeCard ? (
            <EmptyState
              icon={<BookOpenCheck className="h-5 w-5" />}
              title="No cards due"
              description="Generate cards from ready documents or come back when scheduled reviews are due."
            />
          ) : null}
          {dueQuery.isLoading ? <div className="font-jetbrains py-10 text-sm text-neutral-500">Loading due cards...</div> : null}
        </SectionPanel>

        <SectionPanel title="Generate cards" description="Create lightweight flashcards from summaries, chunks, and suggested questions.">
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="font-jetbrains text-xs text-neutral-400">Document</span>
              <select
                value={selectedDocumentId}
                onChange={(event) => setSelectedDocumentId(event.target.value)}
                className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-neutral-200 outline-none"
              >
                <option value="" className="bg-black text-neutral-200">Recent ready documents</option>
                {(documentsQuery.data?.items ?? []).map((document) => (
                  <option key={document.id} value={document.id} className="bg-black text-neutral-200">
                    {document.title}
                  </option>
                ))}
              </select>
            </label>
            <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="w-full">
              {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate flashcards
            </Button>
            {generateMutation.data ? (
              <div className="font-jetbrains rounded-md border border-white/10 bg-white/[0.025] p-3 text-xs text-neutral-400">
                Created {generateMutation.data.created_count} cards.
              </div>
            ) : null}
            {generateMutation.error ? <div className="text-sm text-red-300">{errorMessage(generateMutation.error)}</div> : null}
          </div>
        </SectionPanel>
      </div>
    </PageShell>
  );
}

function ReviewCard({ card, revealed, pending, onReveal, onReview }: { card: Flashcard; revealed: boolean; pending: boolean; onReveal: () => void; onReview: (grade: FlashcardGrade) => void }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
        <div className="font-jetbrains text-xs uppercase tracking-[0.18em] text-neutral-500">Question</div>
        <div className="mt-3 text-xl leading-8 text-white">{card.question}</div>
        {card.source_document_id ? (
          <Link href={`/documents/${card.source_document_id}`} className="font-jetbrains mt-4 inline-flex text-xs text-neutral-500 hover:text-white">
            {card.source_title ?? "Open source"}
          </Link>
        ) : null}
      </div>
      {revealed ? (
        <div className="rounded-xl border border-white/10 bg-black/30 p-5">
          <div className="font-jetbrains text-xs uppercase tracking-[0.18em] text-neutral-500">Answer</div>
          <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-200">{card.answer}</div>
        </div>
      ) : (
        <Button onClick={onReveal} variant="secondary">
          <Eye className="h-4 w-4" />
          Reveal answer
        </Button>
      )}
      {revealed ? (
        <div className="grid gap-2 sm:grid-cols-4">
          {grades.map((grade) => (
            <button
              key={grade.id}
              type="button"
              disabled={pending}
              onClick={() => onReview(grade.id)}
              className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-3 text-left transition hover:border-white/25 hover:bg-white/[0.07] disabled:opacity-50"
            >
              <div className="text-sm text-white">{grade.label}</div>
              <div className="font-jetbrains mt-1 text-xs text-neutral-500">{grade.detail}</div>
            </button>
          ))}
        </div>
      ) : null}
      {pending ? <div className="font-jetbrains flex items-center gap-2 text-xs text-neutral-500"><RotateCcw className="h-3.5 w-3.5 animate-spin" />Scheduling...</div> : null}
    </div>
  );
}
