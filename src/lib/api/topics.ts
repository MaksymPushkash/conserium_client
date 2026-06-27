"use client";

import type { Topic, TopicDetailResponse, TopicListResponse } from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";

export async function listTopics(params: { limit?: number; offset?: number } = {}): Promise<TopicListResponse> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/topics", { params: { query: params } }));
}

export async function getTopic(name: string, params: { document_limit?: number } = {}): Promise<TopicDetailResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/topics/{name}", {
      params: { path: { name }, query: params },
    }),
  );
}

export async function renameTopic(name: string, body: { display_name: string }): Promise<Topic> {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/v1/topics/{name}", {
      params: { path: { name } },
      body,
    }),
  );
}

export async function mergeTopic(name: string, body: { source_names: string[] }): Promise<Topic> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/topics/{name}/merge", {
      params: { path: { name } },
      body,
    }),
  );
}

export async function pinTopic(name: string, pinned = true): Promise<Topic> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/topics/{name}/pin", {
      params: { path: { name } },
      body: { pinned },
    }),
  );
}

export async function ignoreTopic(name: string, ignored = true): Promise<Topic> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/topics/{name}/ignore", {
      params: { path: { name } },
      body: { ignored },
    }),
  );
}
