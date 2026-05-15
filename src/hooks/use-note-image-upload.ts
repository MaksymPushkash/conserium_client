"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChangeEvent } from "react";
import { useRef } from "react";

import type { SlashRange } from "@/components/notes/slash-commands";
import { ingestFile } from "@/lib/api";

interface UseNoteImageUploadOptions {
  collectionId: string;
  insertTextAtRange: (text: string, range: SlashRange, cursorOffset?: number) => void;
}

export function useNoteImageUpload({ collectionId, insertTextAtRange }: UseNoteImageUploadOptions) {
  const queryClient = useQueryClient();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const pendingImageRangeRef = useRef<SlashRange | null>(null);

  const imageUploadMutation = useMutation({
    mutationFn: (file: File) => ingestFile("image", { file, title: file.name, collection_id: collectionId || null }),
    onSuccess: (document) => {
      const range = pendingImageRangeRef.current;
      pendingImageRangeRef.current = null;
      if (!range) return;
      insertTextAtRange(`![${document.title}](document:${document.id})`, range);
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  function startImageUpload(range: SlashRange) {
    pendingImageRangeRef.current = range;
    imageInputRef.current?.click();
  }

  function onImageInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      imageUploadMutation.mutate(file);
    }
  }

  return {
    imageInputRef,
    imageUploadPending: imageUploadMutation.isPending,
    startImageUpload,
    onImageInputChange,
  };
}
