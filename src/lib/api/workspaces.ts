"use client";

import type {
  Workspace,
  WorkspaceAuditEventListResponse,
  WorkspaceListResponse,
  WorkspaceMember,
  WorkspaceMemberListResponse,
} from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";

export async function listWorkspaces(params: { limit?: number; offset?: number } = {}): Promise<WorkspaceListResponse> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/workspaces", { params: { query: params } }));
}

export async function createWorkspace(payload: { name: string; description?: string | null }): Promise<Workspace> {
  return unwrapApiResponse(await apiClient.POST("/api/v1/workspaces", { body: payload }));
}

export async function updateWorkspace(
  id: string,
  payload: { name: string; description?: string | null },
): Promise<Workspace> {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/v1/workspaces/{workspace_id}", {
      params: { path: { workspace_id: id } },
      body: payload,
    }),
  );
}

export async function deleteWorkspace(id: string): Promise<void> {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/v1/workspaces/{workspace_id}", { params: { path: { workspace_id: id } } }),
  );
}

export async function listWorkspaceMembers(id: string): Promise<WorkspaceMemberListResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/workspaces/{workspace_id}/members", { params: { path: { workspace_id: id } } }),
  );
}

export async function inviteWorkspaceMember(
  id: string,
  payload: { email: string; role: "viewer" | "editor" },
): Promise<WorkspaceMember> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/workspaces/{workspace_id}/members", {
      params: { path: { workspace_id: id } },
      body: payload,
    }),
  );
}

export async function updateWorkspaceMemberRole(
  id: string,
  memberId: string,
  payload: { role: "viewer" | "editor" },
): Promise<WorkspaceMember> {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/v1/workspaces/{workspace_id}/members/{member_id}", {
      params: { path: { workspace_id: id, member_id: memberId } },
      body: payload,
    }),
  );
}

export async function removeWorkspaceMember(id: string, memberId: string): Promise<void> {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/v1/workspaces/{workspace_id}/members/{member_id}", {
      params: { path: { workspace_id: id, member_id: memberId } },
    }),
  );
}

export async function listWorkspaceAuditEvents(id: string): Promise<WorkspaceAuditEventListResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/workspaces/{workspace_id}/audit", {
      params: { path: { workspace_id: id } },
    }),
  );
}

export async function transferWorkspaceOwnership(id: string, payload: { member_id: string }): Promise<Workspace> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/workspaces/{workspace_id}/transfer-ownership", {
      params: { path: { workspace_id: id } },
      body: payload,
    }),
  );
}
