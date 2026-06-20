"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpenCheck, Check, Eye, Loader2, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { MetricCard, PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { generateFlashcards, generateLearningPath, generateQuiz, listDocuments, listDueFlashcards, listLearningPaths, listQuizAttempts, listQuizHistory, listQuizWeakAreas, regenerateLearningPath, reviewFlashcard, submitQuiz, updateLearningPathStep } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import type { DocumentListItem, Flashcard, FlashcardGrade, Quiz, LearningPath, QuizAttempt, QuizWeakArea } from "@/lib/types";

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
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [activePath, setActivePath] = useState<LearningPath | null>(null);
  const dueQuery = useQuery({ queryKey: ["review", "due"], queryFn: () => listDueFlashcards(20) });
  const documentsQuery = useQuery({ queryKey: ["documents", "review"], queryFn: () => listDocuments({ limit: 100, status: "READY" }) });
  const quizHistoryQuery = useQuery({ queryKey: ["review", "quiz-history"], queryFn: () => listQuizHistory(8) });
  const quizAttemptsQuery = useQuery({ queryKey: ["review", "quiz-attempts"], queryFn: () => listQuizAttempts(8) });
  const weakAreasQuery = useQuery({ queryKey: ["review", "quiz-weak-areas"], queryFn: () => listQuizWeakAreas(8) });
  const learningPathsQuery = useQuery({ queryKey: ["review", "learning-paths"], queryFn: () => listLearningPaths(6) });
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
  const quizGenerateMutation = useMutation({
    mutationFn: () => generateQuiz({ document_id: selectedDocumentId || null, limit: 5 }),
    onSuccess: (quiz) => {
      setActiveQuiz(quiz);
      setQuizAnswers({});
      setQuizAttempt(null);
    },
  });

  const learningPathMutation = useMutation({
    mutationFn: () => generateLearningPath({ document_id: selectedDocumentId || null, limit: 6 }),
    onSuccess: async (path) => {
      setActivePath(path);
      await queryClient.invalidateQueries({ queryKey: ["review", "learning-paths"] });
    },
  });
  const learningPathStepMutation = useMutation({
    mutationFn: ({ pathId, stepId, status }: { pathId: string; stepId: string; status: "todo" | "done" }) => updateLearningPathStep(pathId, stepId, status),
    onSuccess: async (path) => {
      setActivePath(path);
      await queryClient.invalidateQueries({ queryKey: ["review", "learning-paths"] });
    },
  });
  const learningPathRegenerateMutation = useMutation({
    mutationFn: (pathId: string) => regenerateLearningPath(pathId, 6),
    onSuccess: async (path) => {
      setActivePath(path);
      await queryClient.invalidateQueries({ queryKey: ["review", "learning-paths"] });
    },
  });
  const quizSubmitMutation = useMutation({
    mutationFn: () => {
      if (!activeQuiz) throw new Error("No quiz selected");
      return submitQuiz(
        activeQuiz.id,
        activeQuiz.questions.map((question) => ({ question_id: question.id, option_id: quizAnswers[question.id] ?? "" })),
      );
    },
    onSuccess: async (attempt) => {
      setQuizAttempt(attempt);
      await queryClient.invalidateQueries({ queryKey: ["review", "quiz-attempts"] });
      await queryClient.invalidateQueries({ queryKey: ["review", "quiz-weak-areas"] });
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
          {dueQuery.error ? <div className="text-sm text-neutral-400">{errorMessage(dueQuery.error)}</div> : null}
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

        <div className="space-y-5">
          <SectionPanel title="Generate cards" description="Create lightweight flashcards from summaries, chunks, and suggested questions.">
            <div className="space-y-4">
              <ReviewDocumentSelect
                selectedDocumentId={selectedDocumentId}
                documents={documentsQuery.data?.items ?? []}
                onChange={setSelectedDocumentId}
              />
              <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="w-full">
                {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate flashcards
              </Button>
              {generateMutation.data ? (
                <div className="font-jetbrains rounded-md border border-white/10 bg-white/[0.025] p-3 text-xs text-neutral-400">
                  Created {generateMutation.data.created_count} cards.
                </div>
              ) : null}
              {generateMutation.error ? <div className="text-sm text-neutral-400">{errorMessage(generateMutation.error)}</div> : null}
            </div>
          </SectionPanel>


          <SectionPanel title="Learning path" description="Generate ordered steps from the selected source or recent ready documents.">
            <LearningPathPanel
              activePath={activePath}
              history={learningPathsQuery.data?.items ?? []}
              pending={learningPathMutation.isPending}
              stepPending={learningPathStepMutation.isPending}
              regeneratePending={learningPathRegenerateMutation.isPending}
              error={learningPathMutation.error || learningPathStepMutation.error || learningPathRegenerateMutation.error ? errorMessage(learningPathMutation.error ?? learningPathStepMutation.error ?? learningPathRegenerateMutation.error) : null}
              onGenerate={() => learningPathMutation.mutate()}
              onToggleStep={(pathId, stepId, status) => learningPathStepMutation.mutate({ pathId, stepId, status })}
              onRegenerate={(pathId) => learningPathRegenerateMutation.mutate(pathId)}
              onSelect={setActivePath}
            />
          </SectionPanel>

          <SectionPanel title="Quiz mode" description="Generate a short quiz from the selected source and feed missed areas back into review focus.">
            <QuizPanel
              quiz={activeQuiz}
              answers={quizAnswers}
              attempt={quizAttempt}
              generating={quizGenerateMutation.isPending}
              submitting={quizSubmitMutation.isPending}
              generateError={quizGenerateMutation.error ? errorMessage(quizGenerateMutation.error) : null}
              submitError={quizSubmitMutation.error ? errorMessage(quizSubmitMutation.error) : null}
              history={quizHistoryQuery.data?.items ?? []}
              attempts={quizAttemptsQuery.data?.items ?? []}
              weakAreas={weakAreasQuery.data?.items ?? []}
              onGenerate={() => quizGenerateMutation.mutate()}
              onAnswer={(questionId, optionId) => setQuizAnswers((current) => ({ ...current, [questionId]: optionId }))}
              onRetry={(quiz) => {
                setActiveQuiz(quiz);
                setQuizAnswers({});
                setQuizAttempt(null);
              }}
              onSubmit={() => quizSubmitMutation.mutate()}
            />
          </SectionPanel>
        </div>
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


function ReviewDocumentSelect({
  selectedDocumentId,
  documents,
  onChange,
}: {
  selectedDocumentId: string;
  documents: DocumentListItem[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-jetbrains text-xs text-neutral-400">Document</span>
      <select
        value={selectedDocumentId}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-neutral-200 outline-none"
      >
        <option value="" className="bg-black text-neutral-200">Recent ready documents</option>
        {documents.map((document) => (
          <option key={document.id} value={document.id} className="bg-black text-neutral-200">
            {document.title}
          </option>
        ))}
      </select>
    </label>
  );
}

function QuizPanel({
  quiz,
  answers,
  attempt,
  generating,
  submitting,
  generateError,
  submitError,
  history,
  attempts,
  weakAreas,
  onGenerate,
  onAnswer,
  onRetry,
  onSubmit,
}: {
  quiz: Quiz | null;
  answers: Record<string, string>;
  attempt: QuizAttempt | null;
  generating: boolean;
  submitting: boolean;
  generateError: string | null;
  submitError: string | null;
  history: Quiz[];
  attempts: QuizAttempt[];
  weakAreas: QuizWeakArea[];
  onGenerate: () => void;
  onAnswer: (questionId: string, optionId: string) => void;
  onRetry: (quiz: Quiz) => void;
  onSubmit: () => void;
}) {
  const allAnswered = quiz ? quiz.questions.every((question) => Boolean(answers[question.id])) : false;
  return (
    <div className="space-y-4">
      <Button onClick={onGenerate} disabled={generating} className="w-full" variant="secondary">
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Generate quiz
      </Button>
      {generateError ? <div className="text-sm text-neutral-400">{generateError}</div> : null}

      {weakAreas.length ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
          <div className="text-sm font-medium text-white">Weak areas</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {weakAreas.map((area) => (
              <span key={area.name} className="font-jetbrains rounded border border-white/10 px-2 py-1 text-xs text-neutral-400">
                {area.name} x{area.count}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {quiz ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
            <div className="text-sm font-medium text-white">{quiz.title}</div>
            <div className="font-jetbrains mt-1 text-xs text-neutral-500">{quiz.questions.length} questions</div>
          </div>
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="text-sm leading-6 text-white">{index + 1}. {question.question}</div>
              <div className="mt-3 grid gap-2">
                {question.options.map((option) => {
                  const selected = answers[question.id] === option.id;
                  const showResult = Boolean(attempt);
                  const correct = option.id === question.correct_option_id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={Boolean(attempt)}
                      onClick={() => onAnswer(question.id, option.id)}
                      className={`rounded-md border px-3 py-2 text-left text-sm transition ${selected ? "border-white/50 bg-white/[0.09] text-white" : "border-white/10 bg-white/[0.025] text-neutral-300 hover:border-white/25"} ${showResult && correct ? "border-white bg-white/15" : ""}`}
                    >
                      {option.text}
                    </button>
                  );
                })}
              </div>
              {attempt ? <p className="mt-3 text-xs leading-5 text-neutral-400">{question.explanation}</p> : null}
            </div>
          ))}
          {!attempt ? (
            <Button onClick={onSubmit} disabled={!allAnswered || submitting} className="w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpenCheck className="h-4 w-4" />}
              Submit quiz
            </Button>
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
              <div className="text-sm text-white">Score: {attempt.score}/{attempt.total}</div>
              {attempt.weak_areas.length ? (
                <div className="font-jetbrains mt-2 text-xs text-neutral-500">Weak areas: {attempt.weak_areas.join(", ")}</div>
              ) : (
                <div className="font-jetbrains mt-2 text-xs text-neutral-500">No weak areas from this attempt.</div>
              )}
            </div>
          )}
          {submitError ? <div className="text-sm text-neutral-400">{submitError}</div> : null}
        </div>
      ) : (
        <p className="font-jetbrains text-xs leading-5 text-neutral-500">Generate a quiz after choosing a document, or use recent ready documents.</p>
      )}


      {history.length ? (
        <div className="space-y-2 border-t border-white/10 pt-4">
          <div className="text-sm font-medium text-white">Quiz history</div>
          {history.slice(0, 4).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onRetry(item)}
              className="w-full rounded-md border border-white/10 bg-white/[0.025] p-3 text-left transition hover:border-white/25 hover:bg-white/[0.055]"
            >
              <span className="block truncate text-sm text-neutral-200">{item.title}</span>
              <span className="font-jetbrains mt-1 block text-xs text-neutral-500">Retry saved quiz</span>
            </button>
          ))}
        </div>
      ) : null}
      {attempts.length ? (
        <div className="space-y-2 border-t border-white/10 pt-4">
          <div className="text-sm font-medium text-white">Recent attempts</div>
          {attempts.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-md border border-white/10 bg-white/[0.025] p-3">
              <div className="text-sm text-neutral-200">{item.quiz_title ?? "Quiz attempt"}</div>
              <div className="font-jetbrains mt-1 text-xs text-neutral-500">{item.score}/{item.total} - {new Date(item.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}


function LearningPathPanel({
  activePath,
  history,
  pending,
  stepPending,
  regeneratePending,
  error,
  onGenerate,
  onToggleStep,
  onRegenerate,
  onSelect,
}: {
  activePath: LearningPath | null;
  history: LearningPath[];
  pending: boolean;
  stepPending: boolean;
  regeneratePending: boolean;
  error: string | null;
  onGenerate: () => void;
  onToggleStep: (pathId: string, stepId: string, status: "todo" | "done") => void;
  onRegenerate: (pathId: string) => void;
  onSelect: (path: LearningPath) => void;
}) {
  const path = activePath ?? history[0] ?? null;
  const completed = path?.steps.filter((step) => step.status === "done").length ?? 0;
  const total = path?.steps.length ?? 0;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="space-y-4">
      <Button onClick={onGenerate} disabled={pending} className="w-full" variant="secondary">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Generate path
      </Button>
      {error ? <div className="text-sm text-neutral-400">{error}</div> : null}
      {path ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">{path.title}</div>
                <div className="font-jetbrains mt-1 text-xs text-neutral-500">{completed}/{total} complete - {progress}%</div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => onRegenerate(path.id)} disabled={regeneratePending}>
                {regeneratePending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                Regenerate
              </Button>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            {path.steps.map((step, index) => {
              const done = step.status === "done";
              return (
                <div key={step.id} className="rounded-md border border-white/10 bg-black/25 p-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleStep(path.id, step.id, done ? "todo" : "done")}
                      disabled={stepPending}
                      className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border border-white/15 bg-white/[0.04] text-white hover:border-white/30 disabled:opacity-50"
                      aria-label={done ? "Mark step todo" : "Mark step done"}
                    >
                      {done ? <Check className="h-4 w-4" /> : null}
                    </button>
                    <div className="min-w-0">
                      <div className="font-jetbrains text-xs text-neutral-500">Step {index + 1} / {step.focus}</div>
                      <div className={done ? "mt-1 text-sm text-neutral-500 line-through" : "mt-1 text-sm text-white"}>{step.title}</div>
                      <p className="mt-2 text-xs leading-5 text-neutral-500">{step.summary}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="font-jetbrains text-xs leading-5 text-neutral-500">Generate a path after choosing a document, or use recent ready documents.</p>
      )}
      {history.length > 1 ? (
        <div className="space-y-2 border-t border-white/10 pt-4">
          <div className="text-sm font-medium text-white">Recent paths</div>
          {history.slice(0, 4).map((item) => (
            <button key={item.id} type="button" onClick={() => onSelect(item)} className="w-full rounded-md border border-white/10 bg-white/[0.025] p-3 text-left text-sm text-neutral-200 hover:border-white/25">
              {item.title}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
