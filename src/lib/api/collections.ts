"use client";

import type {
  AnswerShareListResponse,
  Collection,
  CollectionAuditEventListResponse,
  CollectionListResponse,
  CollectionMember,
  CollectionMemberListResponse,
  CollectionShare,
  CollectionWorkspace,
  PublicAnswerShare,
  PublicAskEventListResponse,
  PublicCollectionQueryResponse,
  PublicCollectionResponse,
} from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";

export async function listCollections(
  params: { limit?: number; offset?: number; workspace_id?: string | null } = {},
): Promise<CollectionListResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/collections", { params: { query: params } }),
  );
}

export async function getCollectionWorkspace(id: string): Promise<CollectionWorkspace> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/collections/{collection_id}/workspace", {
      params: { path: { collection_id: id } },
    }),
  );
}

export async function createCollection(payload: {
  name: string;
  description?: string | null;
  color?: string | null;
  workspace_id?: string | null;
}): Promise<Collection> {
  return unwrapApiResponse(await apiClient.POST("/api/v1/collections", { body: payload }));
}

export async function updateCollection(
  id: string,
  payload: { name: string; description?: string | null; color?: string | null },
): Promise<Collection> {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/v1/collections/{collection_id}", {
      params: { path: { collection_id: id } },
      body: payload,
    }),
  );
}

export async function deleteCollection(id: string): Promise<void> {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/v1/collections/{collection_id}", { params: { path: { collection_id: id } } }),
  );
}

export async function listCollectionMembers(id: string): Promise<CollectionMemberListResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/collections/{collection_id}/members", {
      params: { path: { collection_id: id } },
    }),
  );
}

export async function inviteCollectionMember(
  id: string,
  payload: { email: string; role: "viewer" | "editor" },
): Promise<CollectionMember> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/collections/{collection_id}/members", {
      params: { path: { collection_id: id } },
      body: payload,
    }),
  );
}

export async function updateCollectionMemberRole(
  id: string,
  memberId: string,
  payload: { role: "viewer" | "editor" },
): Promise<CollectionMember> {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/v1/collections/{collection_id}/members/{member_id}", {
      params: { path: { collection_id: id, member_id: memberId } },
      body: payload,
    }),
  );
}

export async function removeCollectionMember(id: string, memberId: string): Promise<void> {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/v1/collections/{collection_id}/members/{member_id}", {
      params: { path: { collection_id: id, member_id: memberId } },
    }),
  );
}

export async function listCollectionAuditEvents(id: string): Promise<CollectionAuditEventListResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/collections/{collection_id}/audit", {
      params: { path: { collection_id: id } },
    }),
  );
}

export async function getCollectionShare(id: string): Promise<CollectionShare | null> {
  const share = unwrapApiResponse(
    await apiClient.GET("/api/v1/collections/{collection_id}/share", {
      params: { path: { collection_id: id } },
    }),
  );
  return share;
}

export async function createCollectionShare(id: string): Promise<CollectionShare> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/collections/{collection_id}/share", {
      params: { path: { collection_id: id } },
    }),
  );
}

export async function updateCollectionShareSettings(
  id: string,
  payload: { ask_enabled?: boolean; daily_ask_limit?: number },
): Promise<CollectionShare> {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/v1/collections/{collection_id}/share", {
      params: { path: { collection_id: id } },
      body: payload,
    }),
  );
}

export async function listCollectionShareAskEvents(id: string): Promise<PublicAskEventListResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/collections/{collection_id}/share/events", {
      params: { path: { collection_id: id } },
    }),
  );
}

export async function revokeCollectionShare(id: string): Promise<void> {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/v1/collections/{collection_id}/share", {
      params: { path: { collection_id: id } },
    }),
  );
}

export async function getPublicCollection(slug: string): Promise<PublicCollectionResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/public/collections/{slug}", { params: { path: { slug } } }),
  );
}

export async function queryPublicCollection(
  slug: string,
  payload: { query: string; limit: number },
): Promise<PublicCollectionQueryResponse> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/public/collections/{slug}/query", {
      params: { path: { slug } },
      body: payload,
    }),
  );
}

export async function getPublicAnswerShare(slug: string): Promise<PublicAnswerShare> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/public/answers/{slug}", { params: { path: { slug } } }),
  );
}

export async function listAnswerShares(params: { limit?: number; offset?: number } = {}): Promise<AnswerShareListResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/answer-shares", { params: { query: params } }),
  );
}

export async function revokeAnswerShare(slug: string): Promise<void> {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/v1/answer-shares/{slug}", { params: { path: { slug } } }),
  );
}
