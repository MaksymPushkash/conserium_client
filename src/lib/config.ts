const DEFAULT_API_BASE_URL = process.env.NODE_ENV === "production" ? "https://api.conserium.app" : "http://localhost:8000";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
export const API_V1_URL = `${API_BASE_URL}/api/v1`;
export const DEV_TOOLS_ENABLED = process.env.NEXT_PUBLIC_DEV_TOOLS !== "false";
export const DEBUG_UI_ENABLED = process.env.NEXT_PUBLIC_DEBUG_UI === "true";
