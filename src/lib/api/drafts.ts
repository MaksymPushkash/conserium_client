"use client";

import type { DraftGenerateRequest, DraftResponse } from "@/lib/types";
import { request } from "./transport";

export function generateDraft(payload: DraftGenerateRequest): Promise<DraftResponse> {
  return request<DraftResponse>("/drafts/generate", { method: "POST", body: JSON.stringify(payload) });
}
