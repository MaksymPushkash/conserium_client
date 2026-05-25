import type { QuerySource, RefragContext } from "./query";

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string | null;
}

export interface ChatListResponse {
  items: ChatSession[];
  total: number;
  limit: number;
  offset: number;
}

export interface ChatMessageResponse {
  id: string;
  chat_id: string;
  role: "user" | "assistant" | "system" | string;
  content: string;
  sources: QuerySource[] | null;
  refrag_context: RefragContext | null;
  eval_scores: Record<string, unknown> | null;
  trace_id: string | null;
  created_at: string;
}

export interface ChatDetailResponse {
  session: ChatSession;
  messages: ChatMessageResponse[];
}
