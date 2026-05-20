"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, FileSearch, Loader2, PanelsTopLeft } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { MarkdownPreview } from "@/components/notes/markdown-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { compareDocuments, exportMarkdown, listDocuments } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import { downloadBlob } from "@/lib/download";

export default function ComparePage() {
  const [leftDocumentId, setLeftDocumentId] = useState("");
  const [rightDocumentId, setRightDocumentId] = useState("");
  const [prompt, setPrompt] = useState("");
  const documentsQuery = useQuery({
    queryKey: ["documents", "compare"],
    queryFn: () => listDocuments({ limit: 100, status: "READY" }),
  });
  const documents = documentsQuery.data?.items ?? [];
  const selectedTitles = useMemo(() => {
    const left = documents.find((document) => document.id === leftDocumentId)?.title ?? "Left document";
    const right = documents.find((document) => document.id === rightDocumentId)?.title ?? "Right document";
    return { left, right };
  }, [documents, leftDocumentId, rightDocumentId]);
  const compareMutation = useMutation({ mutationFn: compareDocuments });
  const compareSources = compareMutation.data?.sources ?? [];
  const exportMutation = useMutation({
    mutationFn: (format: "markdown" | "pdf") =>
      exportMarkdown({
        title: compareMutation.data
          ? `${compareMutation.data.left_title} vs ${compareMutation.data.right_title}`
          : "Cortex comparison",
        markdown: compareMutation.data?.markdown ?? "",
        format,
      }),
    onSuccess: ({ blob, filename }) => downloadBlob(blob, filename),
  });
  const canCompare = Boolean(leftDocumentId && rightDocumentId && leftDocumentId !== rightDocumentId);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canCompare) return;
    compareMutation.mutate({
      left_document_id: leftDocumentId,
      right_document_id: rightDocumentId,
      prompt: prompt.trim() || null,
      limit: 12,
    });
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 md:p-8 xl:grid-cols-[420px_minmax(0,1fr)]">
      <section className="space-y-6">
        <header>
          <h1 className="text-3xl font-normal tracking-normal">Compare</h1>
          <p className="font-jetbrains mt-2 text-xs text-neutral-500">Compare two saved documents using Cortex sources only.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <DocumentSelect
                label="Left"
                value={leftDocumentId}
                documents={documents}
                onChange={setLeftDocumentId}
              />
              <DocumentSelect
                label="Right"
                value={rightDocumentId}
                documents={documents}
                onChange={setRightDocumentId}
              />
              <label className="block space-y-2">
                <span className="font-jetbrains text-xs text-neutral-500">Focus</span>
                <Textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Focus on tradeoffs, contradictions, or implementation details"
                  className="min-h-28"
                />
              </label>
              <Button type="submit" disabled={compareMutation.isPending || !canCompare || documentsQuery.isLoading}>
                {compareMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PanelsTopLeft className="h-4 w-4" />}
                Compare documents
              </Button>
            </form>
          </CardContent>
        </Card>

        {leftDocumentId && rightDocumentId && leftDocumentId === rightDocumentId ? (
          <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-100">
            Choose two different documents.
          </div>
        ) : null}

        {documentsQuery.error ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {errorMessage(documentsQuery.error)}
          </div>
        ) : null}

        {compareMutation.error ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {errorMessage(compareMutation.error)}
          </div>
        ) : null}
      </section>

      <section className="min-w-0">
        <Card>
          <CardHeader>
            <CardTitle>{compareMutation.data ? `${compareMutation.data.left_title} vs ${compareMutation.data.right_title}` : "Output"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {compareMutation.data ? (
              <>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => exportMutation.mutate("markdown")}
                    disabled={exportMutation.isPending}
                  >
                    <Download className="h-4 w-4" />
                    MD
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => exportMutation.mutate("pdf")}
                    disabled={exportMutation.isPending}
                  >
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
                <MarkdownPreview title="Comparison" content={compareMutation.data.markdown} />
                <div className="space-y-2 border-t border-neutral-900 pt-4">
                  <h2 className="text-sm font-medium text-white">Sources</h2>
                  {compareSources.length ? (
                    <div className="grid gap-2">
                      {compareSources.map((source) => (
                        <a
                          key={source.chunk_id}
                          href={`/documents/${source.document_id}`}
                          className="block rounded-md border border-white/10 bg-white/[0.02] p-3 text-sm text-neutral-300 hover:border-white/20 hover:text-white"
                        >
                          <span className="font-jetbrains text-xs text-neutral-500">{source.citation}</span>{" "}
                          {source.document_title ?? source.document_id}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500">No cited saved sources.</p>
                  )}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<FileSearch className="h-5 w-5" />}
                title={documents.length ? "Select two documents" : "No ready documents available"}
                description={
                  documents.length
                    ? "Compare loads direct context from both documents and produces a cited Markdown analysis."
                    : "Ingest and process at least two documents before running compare."
                }
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function DocumentSelect({
  label,
  value,
  documents,
  onChange,
}: {
  label: string;
  value: string;
  documents: Array<{ id: string; title: string; type: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-jetbrains text-xs text-neutral-500">{label}</span>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select document</option>
        {documents.map((document) => (
          <option key={document.id} value={document.id}>
            {document.title}
          </option>
        ))}
      </Select>
    </label>
  );
}
