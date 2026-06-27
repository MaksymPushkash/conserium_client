"use client";

import { API_BASE_URL } from "@/lib/config";
import type { ObservabilitySummary } from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";

export async function getMetricsText(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/metrics`, { credentials: "include" });
  if (!response.ok) {
    throw new Error(`Metrics request failed: ${response.status}`);
  }
  return response.text();
}

export async function getObservabilitySummary(): Promise<ObservabilitySummary> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/observability/summary"));
}

export const getQueryMetricsSummary = getObservabilitySummary;
