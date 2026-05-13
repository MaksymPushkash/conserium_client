"use client";

import type { DocumentResponse } from "@/lib/types";
import { request } from "./transport";

export function ingestFile(
  type: "pdf" | "image",
  payload: { file: File; title?: string; collection_id?: string | null; language?: string },
): Promise<DocumentResponse> {
  const formData = new FormData();
  formData.set("file", payload.file);
  if (payload.title) formData.set("title", payload.title);
  if (payload.collection_id) formData.set("collection_id", payload.collection_id);
  if (payload.language) formData.set("language", payload.language);
  return request<DocumentResponse>(`/ingest/${type}`, { method: "POST", body: formData });
}

export function uploadDocument(file: File, collectionId?: string): Promise<DocumentResponse> {
  return ingestFile(file.type === "application/pdf" ? "pdf" : "image", { file, collection_id: collectionId });
}

export function ingestDocument(payload: {
  title: string;
  type: string;
  collection_id?: string | null;
  source_url?: string | null;
  raw_content?: string | null;
  language?: string | null;
}): Promise<DocumentResponse> {
  return request<DocumentResponse>("/ingest", { method: "POST", body: JSON.stringify(payload) });
}

export function ingestUrl(payload: { url: string; title?: string; collection_id?: string | null }): Promise<DocumentResponse> {
  return ingestDocument({
    title: payload.title || payload.url,
    type: "URL",
    source_url: payload.url,
    collection_id: payload.collection_id,
  });
}

export function ingestText(payload: {
  title: string;
  content: string;
  collection_id?: string | null;
}): Promise<DocumentResponse> {
  return request<DocumentResponse>("/documents/ingest-text", {
    method: "POST",
    body: JSON.stringify({ title: payload.title, raw_text: payload.content, collection_id: payload.collection_id }),
  });
}
