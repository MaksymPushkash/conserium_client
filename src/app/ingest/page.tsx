"use client";

import { CheckCircle2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api/transport";
import { cn } from "@/lib/utils";
import { modeConfig, modes, useIngestWorkflow } from "./use-ingest-workflow";

export default function IngestPage() {
  const workflow = useIngestWorkflow();
  const {
    mode,
    setMode,
    title,
    setTitle,
    language,
    setLanguage,
    collectionId,
    setCollectionId,
    rawContent,
    setRawContent,
    sourceUrl,
    setSourceUrl,
    file,
    setFile,
    trackedDocument,
    collectionsQuery,
    mutation,
    status,
    canSubmit,
  } = workflow;

  return (
    <PageShell className="max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Add source"
        title="Ingest content"
        description="Drop files, paste text, or index a URL. Conserium extracts, embeds, summarizes, and makes the source searchable."
      />

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-1">
            <CardTitle>Source type</CardTitle>
            <p className="text-xs text-neutral-400">1. Choose source, 2. add details, 3. queue ingestion.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={workflow.submit} className="space-y-6">
              <label className="flex min-h-28 cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed border-white/15 bg-white/[0.045] px-5 transition-all duration-200 hover:border-white/35 hover:bg-white/[0.065]">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <UploadCloud className="h-4 w-4 text-neutral-200" />
                    Drop files here or paste content below
                  </div>
                  <div className="mt-2 text-sm text-neutral-400">PDFs, images, markdown, URLs, and notes are supported.</div>
                </div>
                <span className="font-jetbrains rounded-md border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-neutral-300">Browse</span>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(event) => {
                    workflow.selectDroppedFile(event.target.files?.[0] ?? null);
                  }}
                  className="sr-only"
                />
              </label>

              <div className="grid gap-3 md:grid-cols-5">
                {modes.map((item) => {
                  const config = modeConfig[item];
                  const Icon = config.icon;
                  return (
                    <button
                      key={item}
                      type="button"
                      className={cn(
                        "group min-h-28 rounded-lg border p-4 text-left transition-all duration-200",
                        mode === item
                          ? "border-white/35 bg-white/[0.075] shadow-[0_0_30px_rgba(255,255,255,0.08)]"
                          : "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]",
                      )}
                      onClick={() => setMode(item)}
                    >
                      <Icon className={cn("h-5 w-5 transition-colors", mode === item ? "text-white" : "text-neutral-500 group-hover:text-neutral-200")} />
                      <div className="mt-4 text-sm text-white">{config.label}</div>
                      <div className="mt-1 text-xs leading-5 text-neutral-400">{config.description}</div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-lg border border-white/10 bg-black/35 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" className="font-jetbrains" />
                  <Input
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    placeholder="Language, optional"
                    className="font-jetbrains"
                  />
                </div>
                <select
                  className="mt-3 h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-neutral-300 outline-none transition-colors focus:border-white/40"
                  value={collectionId ?? ""}
                  onChange={(event) => setCollectionId(event.target.value || null)}
                >
                  <option value="" className="bg-black text-neutral-200">
                    No collection
                  </option>
                  {collectionsQuery.data?.items.map((collection) => {
                    const isViewer = collection.access_role === "viewer";
                    const accessLabel =
                      collection.access_role === "owner"
                        ? collection.workspace_id
                          ? "workspace owner"
                          : "owner"
                        : collection.access_role === "editor"
                          ? "shared editor"
                          : "view only";
                    return (
                      <option key={collection.id} value={collection.id} disabled={isViewer} className="bg-black text-neutral-200">
                        {collection.name} - {accessLabel}
                      </option>
                    );
                  })}
                </select>
              </div>

              {mode === "TEXT" ? (
                <Textarea
                  value={rawContent}
                  onChange={(event) => setRawContent(event.target.value)}
                  placeholder="Paste notes, markdown, or raw text"
                  className="font-jetbrains min-h-72 bg-black/35"
                />
              ) : null}

              {mode === "URL" || mode === "YOUTUBE" ? (
                <div className="rounded-lg border border-white/10 bg-black/35 p-4">
                  <Input
                    value={sourceUrl}
                    onChange={(event) => setSourceUrl(event.target.value)}
                    placeholder={mode === "YOUTUBE" ? "YouTube URL" : "Article URL"}
                    className="font-jetbrains"
                  />
                </div>
              ) : null}

              {mode === "PDF" || mode === "IMAGE" ? (
                <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/35 px-6 text-center transition-colors hover:border-white/30 hover:bg-white/[0.035]">
                  <UploadCloud className="h-8 w-8 text-neutral-500" />
                  <span className="mt-4 text-sm text-white">{file ? file.name : `Drop or choose a ${mode === "PDF" ? "PDF" : "image"}`}</span>
                  <span className="mt-2 text-xs text-neutral-500">{mode === "PDF" ? "application/pdf" : "image files"} supported</span>
                  <input
                    type="file"
                    accept={mode === "PDF" ? "application/pdf" : "image/*"}
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                </label>
              ) : null}

              {mutation.error ? (
                <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
                  {errorMessage(mutation.error)}
                </div>
              ) : null}

              <div className="flex items-center justify-between border-t border-white/10 pt-5">
                <div className="font-jetbrains text-xs text-neutral-400">
                  {canSubmit ? "Ready to queue" : "Complete required fields to continue"}
                </div>
                <Button disabled={!canSubmit || mutation.isPending}>{mutation.isPending ? "Queueing..." : "Queue ingestion"}</Button>
              </div>
            </form>
          </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
        <SectionPanel title="What gets indexed" description="Conserium stores normalized text, metadata, embeddings, summaries, tags, topics, and citations.">
          <div className="space-y-3 text-sm">
            {["Source metadata", "Extracted text", "Embeddings", "Summary and topics"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-neutral-300">
                <CheckCircle2 className="h-4 w-4 text-neutral-300" />
                {item}
              </div>
            ))}
          </div>
        </SectionPanel>

        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trackedDocument ? (
              <>
                <div>
                  <div className="font-medium">{trackedDocument.title}</div>
                  <div className="font-jetbrains mt-1 truncate text-xs text-neutral-500">{trackedDocument.id}</div>
                </div>
                <StatusBadge status={status?.status ?? trackedDocument.status} />
                <Progress value={status?.progress ?? 0} />
                {(status?.status ?? trackedDocument.status) !== "READY" ? (
                  <div className="text-sm text-neutral-500">{status?.message ?? "Waiting for worker status..."}</div>
                ) : null}
                {status?.failure_reason ? <div className="text-sm text-neutral-500">{status.failure_reason}</div> : null}
                {status?.timeline?.length ? (
                  <div className="space-y-3 pt-2">
                    {status.timeline.map((step) => (
                      <div key={step.key} className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-neutral-300">{step.label}</span>
                        <span
                          className={cn(
                            "font-jetbrains",
                            step.state === "failed"
                              ? "text-neutral-500"
                              : step.state === "complete"
                                ? "text-neutral-300"
                                : step.state === "current"
                                  ? "text-neutral-200"
                                  : "text-neutral-500",
                          )}
                        >
                          {step.state}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="font-jetbrains text-xs leading-6 text-neutral-400">Submit content to start pipeline tracking.</div>
            )}
          </CardContent>
        </Card>
        </aside>
      </div>
    </PageShell>
  );
}
