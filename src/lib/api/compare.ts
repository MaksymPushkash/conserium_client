"use client";

import type { CompareDocumentsRequest, CompareDocumentsResponse } from "@/lib/types";
import { request } from "./transport";

export function compareDocuments(payload: CompareDocumentsRequest): Promise<CompareDocumentsResponse> {
  return request<CompareDocumentsResponse>("/compare/documents", { method: "POST", body: JSON.stringify(payload) });
}
