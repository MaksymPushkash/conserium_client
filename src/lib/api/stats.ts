"use client";

import type { StatsOverviewResponse, StatsTimelineResponse } from "@/lib/types";
import { request } from "./transport";

export function getStatsOverview(): Promise<StatsOverviewResponse> {
  return request<StatsOverviewResponse>("/stats/overview");
}

export function getStatsTimeline(months = 6): Promise<StatsTimelineResponse> {
  return request<StatsTimelineResponse>(`/stats/timeline?months=${months}`);
}
