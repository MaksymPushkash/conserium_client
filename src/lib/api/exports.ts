"use client";

import type { NotionExportResponse } from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";
import { ApiError, authenticatedFetch, readPayload } from "./transport";

export async function exportMarkdown(payload: {
  title: string;
  markdown: string;
  format: "markdown" | "pdf";
}): Promise<{ blob: Blob; filename: string }> {
  const response = await authenticatedFetch("/exports/markdown", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new ApiError(response.status, await readPayload(response));
  }
  return {
    blob: await response.blob(),
    filename: filenameFromContentDisposition(response.headers.get("Content-Disposition")) ?? fallbackFilename(payload),
  };
}

export async function exportNotion(payload: {
  title: string;
  markdown: string;
  parent_page_id?: string | null;
}): Promise<NotionExportResponse> {
  return unwrapApiResponse(await apiClient.POST("/api/v1/exports/notion", { body: payload }));
}

export function filenameFromContentDisposition(value: string | null): string | null {
  if (!value) return null;
  const match = /filename="([^"]+)"/.exec(value);
  return match?.[1] ?? null;
}

function fallbackFilename(payload: { title: string; format: "markdown" | "pdf" }) {
  const extension = payload.format === "pdf" ? "pdf" : "md";
  return `${payload.title.trim() || "export"}.${extension}`;
}
