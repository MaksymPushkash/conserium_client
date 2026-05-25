export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface ApiKeyListResponse {
  items: ApiKey[];
}

export interface CreatedApiKeyResponse {
  api_key: ApiKey;
  token: string;
}
