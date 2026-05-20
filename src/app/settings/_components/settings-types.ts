import type { AIPreferences, PrivacyPreferences, UserPreferences } from "@/lib/types";

export type SettingsTab = "appearance" | "account" | "privacy" | "ai" | "integrations";

export const tabs: Array<{ id: SettingsTab; label: string }> = [
  { id: "appearance", label: "Appearance" },
  { id: "account", label: "About & account" },
  { id: "privacy", label: "Privacy" },
  { id: "ai", label: "AI" },
  { id: "integrations", label: "Integrations" },
];

export const defaultPreferences: UserPreferences = {
  appearance: { theme: "dark" },
  privacy: { share_usage_data: false, retain_query_history: true },
  ai: { answer_language: "match_question", retrieval_depth: "balanced" },
};

export type { AIPreferences, PrivacyPreferences };
