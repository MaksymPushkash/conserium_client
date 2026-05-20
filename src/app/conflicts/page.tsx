"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { detectConflicts, listCollections } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";

export default function ConflictsPage() {
  const [collectionId, setCollectionId] = useState("");
  const collectionsQuery = useQuery({ queryKey: ["collections", "conflicts"], queryFn: () => listCollections({ limit: 100 }) });
  const conflictsQuery = useQuery({
    queryKey: ["conflicts", collectionId || "all"],
    queryFn: () => detectConflicts({ collection_id: collectionId || null, limit: 100 }),
  });
  const selectedCollectionName = useMemo(() => {
    if (!collectionId) return "All ready documents";
    return collectionsQuery.data?.items.find((collection) => collection.id === collectionId)?.name ?? "Selected collection";
  }, [collectionId, collectionsQuery.data?.items]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-normal tracking-normal">Conflict detector</h1>
        <p className="font-jetbrains mt-2 text-xs text-neutral-500">
          Find saved materials that give opposing guidance.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Scope</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
          <Select
            value={collectionId}
            onChange={(event) => setCollectionId(event.target.value)}
          >
            <option value="">All ready documents</option>
            {(collectionsQuery.data?.items ?? []).map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </Select>
          <div className="font-jetbrains text-sm text-neutral-500">
            {conflictsQuery.data?.analyzed_document_count ?? 0} analyzed
          </div>
          <Button variant="secondary" onClick={() => void conflictsQuery.refetch()} disabled={conflictsQuery.isFetching}>
            {conflictsQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Run scan
          </Button>
        </CardContent>
      </Card>

      {collectionsQuery.error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage(collectionsQuery.error)}
        </div>
      ) : null}
      {conflictsQuery.error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage(conflictsQuery.error)}
        </div>
      ) : null}

      {conflictsQuery.data?.conflicts.length ? (
        <section className="grid gap-4">
          {conflictsQuery.data.conflicts.map((conflict) => (
            <Card key={conflict.subject}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="min-w-0">{conflict.subject}</CardTitle>
                <Badge>{Math.round(conflict.score * 100)}%</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-neutral-300">{conflict.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {conflict.documents.map((document) => (
                    <Badge key={document.id}>{document.title}</Badge>
                  ))}
                </div>
                <div className="grid gap-2">
                  {conflict.evidence.map((evidence) => (
                    <div key={evidence} className="rounded-md border border-white/10 bg-white/[0.02] p-3 text-sm leading-6 text-neutral-400">
                      {evidence}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      {conflictsQuery.data && !conflictsQuery.data.conflicts.length ? (
        <EmptyState
          icon={<ShieldCheck className="h-5 w-5" />}
          title={`No deterministic conflicts found in ${selectedCollectionName}`}
          description="The detector checked direct opposing guidance across the selected ready documents. It does not infer subtle disagreements yet."
        />
      ) : null}
    </div>
  );
}
