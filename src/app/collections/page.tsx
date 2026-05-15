"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createCollection, deleteCollection, listCollections, updateCollection } from "@/lib/api";

export default function CollectionsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [renamingCollection, setRenamingCollection] = useState<{ id: string; name: string } | null>(null);
  const collectionsQuery = useQuery({ queryKey: ["collections"], queryFn: () => listCollections({ limit: 100 }) });
  const createMutation = useMutation({
    mutationFn: createCollection,
    onSuccess: async () => {
      setName("");
      setDescription("");
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, nextName }: { id: string; nextName: string }) => updateCollection(id, { name: nextName }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collections"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collections"] }),
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createMutation.mutate({ name: trimmed, description: description.trim() || null });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-normal tracking-normal">Collections</h1>
        <p className="font-jetbrains mt-2 text-xs text-neutral-500">Scope documents, notes, and chat retrieval.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Create collection</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
            <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" />
            <Button disabled={!name.trim() || createMutation.isPending}>Create</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{collectionsQuery.data?.items.length ?? 0} collections</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-white/10">
          {collectionsQuery.data?.items.map((collection) => (
            <div key={collection.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div>
                <div className="font-normal text-white">{collection.name}</div>
                <div className="font-jetbrains mt-1 text-xs text-neutral-500">{collection.description ?? "No description"}</div>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setRenamingCollection({ id: collection.id, name: collection.name });
                }}
              >
                Rename
              </Button>
              <Button variant="danger" size="icon" onClick={() => deleteMutation.mutate(collection.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      {renamingCollection ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Rename collection">
          <form
            className="w-full max-w-md rounded-lg border border-white/10 bg-black p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
            onSubmit={(event) => {
              event.preventDefault();
              const nextName = renamingCollection.name.trim();
              if (!nextName) return;
              updateMutation.mutate(
                { id: renamingCollection.id, nextName },
                { onSuccess: () => setRenamingCollection(null) },
              );
            }}
          >
            <h2 className="text-lg font-normal text-white">Rename collection</h2>
            <Input
              className="mt-4"
              value={renamingCollection.name}
              onChange={(event) => setRenamingCollection({ ...renamingCollection, name: event.target.value })}
              autoFocus
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setRenamingCollection(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!renamingCollection.name.trim() || updateMutation.isPending}>
                Save
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
