"use client";

import { API_BASE_URL } from "@/lib/config";
import type { ObservabilitySummary } from "@/lib/types";
import { request } from "./transport";

export async function getMetricsText(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/metrics`, { credentials: "include" });
  if (!response.ok) {
    throw new Error(`Metrics request failed: ${response.status}`);
  }
  return response.text();
}

export function getObservabilitySummary(): Promise<ObservabilitySummary> {
  return request<ObservabilitySummary>("/observability/summary");
}

export const getQueryMetricsSummary = getObservabilitySummary;
