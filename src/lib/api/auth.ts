"use client";

import type { TokenResponse, UserPreferences, UserResponse } from "@/lib/types";
import { API_V1_URL } from "@/lib/config";
import { apiClient, unwrapApiResponse } from "./generated/client";
import { request } from "./transport";

export async function register(payload: { email: string; password: string; display_name?: string | null }): Promise<TokenResponse> {
  return unwrapApiResponse(await apiClient.POST("/api/v1/auth/register", { body: payload }));
}

export function login(payload: { email: string; password: string }): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }, false);
}

export function refreshSession(): Promise<TokenResponse> {
  return request<TokenResponse>(
    "/auth/refresh",
    {
      method: "POST",
    },
    false,
  );
}

export async function getCurrentUser(): Promise<UserResponse> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/users/me"));
}

export const fetchMe = getCurrentUser;

export async function getUserPreferences(): Promise<UserPreferences> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/users/preferences"));
}

export async function updateUserPreferences(payload: UserPreferences): Promise<UserPreferences> {
  return unwrapApiResponse(await apiClient.PATCH("/api/v1/users/preferences", { body: payload }));
}

export async function logout(): Promise<void> {
  return unwrapApiResponse(await apiClient.POST("/api/v1/auth/logout"));
}

export async function logoutEverywhere(): Promise<void> {
  return unwrapApiResponse(await apiClient.POST("/api/v1/auth/logout/all"));
}

export const logoutAll = logoutEverywhere;

export async function deleteCurrentUser(): Promise<void> {
  return unwrapApiResponse(await apiClient.DELETE("/api/v1/users/me"));
}

export const deleteAccount = deleteCurrentUser;

export function oauthUrl(provider: "google" | "github"): string {
  return `${API_V1_URL}/auth/${provider}`;
}
