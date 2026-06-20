import type { ConflictDetectionResponse } from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";

export interface DetectConflictsParams {
  collection_id?: string | null;
  limit?: number;
}

export async function detectConflicts(params: DetectConflictsParams = {}): Promise<ConflictDetectionResponse> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/conflicts", { params: { query: params } }));
}
