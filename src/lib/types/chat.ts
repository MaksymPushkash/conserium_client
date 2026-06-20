import type { QuerySource, RefragContext } from "./query";
import type { ApiSchema } from "./generated";

export type ChatSession = ApiSchema<"ChatSessionResponse">;
export type ChatListResponse = ApiSchema<"ChatListResponse">;
export type ChatMessageResponse = Omit<ApiSchema<"ChatMessageResponse">, "refrag_context" | "sources"> & {
  sources: QuerySource[] | null;
  refrag_context: RefragContext | null;
};
export type ChatDetailResponse = Omit<ApiSchema<"ChatDetailResponse">, "messages" | "session"> & {
  session: ChatSession;
  messages: ChatMessageResponse[];
};
