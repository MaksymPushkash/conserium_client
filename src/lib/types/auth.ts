export interface TokenResponse {
  access_token: string;
}

export interface AppearancePreferences {
  theme: "dark";
}

export interface PrivacyPreferences {
  share_usage_data: boolean;
  retain_query_history: boolean;
}

export interface AIPreferences {
  answer_language: "match_question" | "english" | "ukrainian";
  retrieval_depth: "focused" | "balanced" | "broad";
}

export interface UserPreferences {
  appearance: AppearancePreferences;
  privacy: PrivacyPreferences;
  ai: AIPreferences;
}

export interface UserResponse {
  id: string;
  email: string;
  display_name: string | null;
  is_active: boolean;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string | null;
}
