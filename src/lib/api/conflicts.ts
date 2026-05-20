import { request } from "./transport";
import type { ConflictDetectionResponse } from "@/lib/types";

export interface DetectConflictsParams {
  collection_id?: string | null;
  limit?: number;
}

export function detectConflicts(params: DetectConflictsParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.collection_id) searchParams.set("collection_id", params.collection_id);
  if (params.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  return request<ConflictDetectionResponse>(`/conflicts${query ? `?${query}` : ""}`);
}
