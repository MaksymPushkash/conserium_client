"use client";

import type { DailyDigestResponse, StatsOverviewResponse, StatsTimelineResponse, WeeklyReportResponse } from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";

export async function getStatsOverview(): Promise<StatsOverviewResponse> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/stats/overview"));
}

export async function getStatsTimeline(months = 6): Promise<StatsTimelineResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/stats/timeline", {
      params: { query: { months } },
    }),
  );
}

export async function getDailyDigest(limit = 3): Promise<DailyDigestResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/stats/daily-digest", {
      params: { query: { limit } },
    }),
  );
}

export async function getWeeklyReport(): Promise<WeeklyReportResponse> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/stats/weekly-report"));
}
