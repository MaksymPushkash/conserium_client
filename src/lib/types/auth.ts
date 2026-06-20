import type { ApiSchema } from "./generated";

export type TokenResponse = Pick<ApiSchema<"TokenResponse">, "access_token">;
export type AppearancePreferences = ApiSchema<"AppearancePreferences">;
export type PrivacyPreferences = ApiSchema<"PrivacyPreferences">;
export type AIPreferences = ApiSchema<"AIPreferences">;
export type UserPreferences = ApiSchema<"UserPreferencesResponse">;
export type UserResponse = ApiSchema<"UserResponse">;
