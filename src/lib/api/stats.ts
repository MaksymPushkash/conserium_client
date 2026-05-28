"use client";

import type { DailyDigestResponse, StatsOverviewResponse, StatsTimelineResponse, WeeklyReportResponse } from "@/lib/types";
import { request } from "./transport";

export function getStatsOverview(): Promise<StatsOverviewResponse> {
  return request<StatsOverviewResponse>("/stats/overview");
}

export function getStatsTimeline(months = 6): Promise<StatsTimelineResponse> {
  return request<StatsTimelineResponse>(`/stats/timeline?months=${months}`);
}

export function getDailyDigest(limit = 3): Promise<DailyDigestResponse> {
  return request<DailyDigestResponse>(`/stats/daily-digest?limit=${limit}`);
}

export function getWeeklyReport(): Promise<WeeklyReportResponse> {
  return request<WeeklyReportResponse>("/stats/weekly-report");
}
