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
                  const nextName = window.prompt("Collection name", collection.name);
                  if (nextName?.trim()) updateMutation.mutate({ id: collection.id, nextName: nextName.trim() });
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
    </div>
  );
}
