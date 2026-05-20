"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, FileUp, ImageIcon, LinkIcon, UploadCloud, Youtube } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getDocumentStatus, ingestDocument, ingestFile, listCollections } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import type { DocumentResponse, DocumentType } from "@/lib/types";
import { cn } from "@/lib/utils";

type Mode = "TEXT" | "URL" | "YOUTUBE" | "PDF" | "IMAGE";

const modes: Mode[] = ["TEXT", "URL", "YOUTUBE", "PDF", "IMAGE"];

const modeConfig: Record<Mode, { label: string; description: string; icon: typeof FileText }> = {
  TEXT: { label: "Text", description: "Paste notes, drafts, or markdown.", icon: FileText },
  URL: { label: "URL", description: "Import an article or web page.", icon: LinkIcon },
  YOUTUBE: { label: "YouTube", description: "Extract transcript and context.", icon: Youtube },
  PDF: { label: "PDF", description: "Upload a document file.", icon: FileUp },
  IMAGE: { label: "Image", description: "Upload visual source material.", icon: ImageIcon },
};

export default function IngestPage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("TEXT");
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [trackedDocument, setTrackedDocument] = useState<DocumentResponse | null>(null);
  const collectionsQuery = useQuery({ queryKey: ["collections"], queryFn: () => listCollections({ limit: 100 }) });

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === "PDF" || mode === "IMAGE") {
        if (!file) throw new Error("Select a file first");
        return ingestFile(mode.toLowerCase() as "pdf" | "image", {
          file,
          title: title || file.name,
          collection_id: collectionId,
          language: language || undefined,
        });
      }
      return ingestDocument({
        title,
        type: mode as DocumentType,
        raw_content: mode === "TEXT" ? rawContent : null,
        source_url: mode === "URL" || mode === "YOUTUBE" ? sourceUrl : null,
        collection_id: collectionId,
        language: language || null,
      });
    },
    onSuccess: (document) => {
      setTrackedDocument(document);
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const statusQuery = useQuery({
    queryKey: ["document-status", trackedDocument?.id],
    queryFn: () => getDocumentStatus(trackedDocument!.id),
    enabled: Boolean(trackedDocument?.id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "READY" || status === "FAILED" ? false : 2000;
    },
  });

  const status = statusQuery.data;
  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    if (mode === "TEXT") return Boolean(rawContent.trim());
    if (mode === "URL" || mode === "YOUTUBE") return Boolean(sourceUrl.trim());
    return Boolean(file);
  }, [file, mode, rawContent, sourceUrl, title]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 md:grid-cols-[minmax(0,1fr)_360px] md:p-10">
      <section className="space-y-6">
        <header className="max-w-2xl">
          <p className="font-jetbrains text-xs uppercase tracking-[0.18em] text-neutral-600">Add source</p>
          <h1 className="mt-3 text-3xl font-normal tracking-normal text-white">Ingest content</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Add text, links, PDFs, or images. Cortex will extract, embed, summarize, and make the source searchable.
          </p>
        </header>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-1">
            <CardTitle>Source type</CardTitle>
            <p className="text-xs text-neutral-600">Choose the shape of the material before filling source details.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
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
                          ? "border-white/40 bg-white/[0.08] shadow-[0_0_36px_rgba(255,255,255,0.05)]"
                          : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/[0.04]",
                      )}
                      onClick={() => setMode(item)}
                    >
                      <Icon className={cn("h-5 w-5 transition-colors", mode === item ? "text-white" : "text-neutral-500 group-hover:text-neutral-200")} />
                      <div className="mt-4 text-sm text-white">{config.label}</div>
                      <div className="mt-1 text-xs leading-5 text-neutral-600">{config.description}</div>
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
                  {collectionsQuery.data?.items.map((collection) => (
                    <option key={collection.id} value={collection.id} className="bg-black text-neutral-200">
                      {collection.name}
                    </option>
                  ))}
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
                  <span className="mt-2 text-xs text-neutral-600">{mode === "PDF" ? "application/pdf" : "image files"} supported</span>
                  <input
                    type="file"
                    accept={mode === "PDF" ? "application/pdf" : "image/*"}
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                </label>
              ) : null}

              {mutation.error ? (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  {errorMessage(mutation.error)}
                </div>
              ) : null}

              <div className="flex items-center justify-between border-t border-white/10 pt-5">
                <div className="font-jetbrains text-xs text-neutral-600">
                  {canSubmit ? "Ready to queue" : "Complete required fields to continue"}
                </div>
                <Button disabled={!canSubmit || mutation.isPending}>{mutation.isPending ? "Queueing..." : "Queue ingestion"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trackedDocument ? (
              <>
                <div>
                  <div className="font-medium">{trackedDocument.title}</div>
                  <div className="font-jetbrains mt-1 truncate text-xs text-neutral-600">{trackedDocument.id}</div>
                </div>
                <StatusPill status={status?.status ?? trackedDocument.status} />
                <Progress value={status?.progress ?? 0} />
                {(status?.status ?? trackedDocument.status) !== "READY" ? (
                  <div className="text-sm text-neutral-500">{status?.message ?? "Waiting for worker status..."}</div>
                ) : null}
                {status?.failure_reason ? <div className="text-sm text-red-400">{status.failure_reason}</div> : null}
                {status?.timeline?.length ? (
                  <div className="space-y-3 pt-2">
                    {status.timeline.map((step) => (
                      <div key={step.key} className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-neutral-300">{step.label}</span>
                        <span
                          className={cn(
                            "font-jetbrains",
                            step.state === "failed"
                              ? "text-red-400"
                              : step.state === "complete"
                                ? "text-neutral-300"
                                : step.state === "current"
                                  ? "text-amber-300"
                                  : "text-neutral-600",
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
              <div className="font-jetbrains text-xs leading-6 text-neutral-500">Submit content to start pipeline tracking.</div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
