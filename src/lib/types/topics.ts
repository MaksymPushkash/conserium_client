import type { ApiSchema, RequiredApiFields } from "./generated";

export type Topic = RequiredApiFields<ApiSchema<"TopicResponse">, "source_names">;
export type TopicDocument = ApiSchema<"TopicDocumentResponse">;
export type TopicEvent = RequiredApiFields<ApiSchema<"TopicEventResponse">, "source_names">;
export type TopicListResponse = Omit<ApiSchema<"TopicListResponse">, "items"> & { items: Topic[] };
export type TopicDetailResponse = Omit<ApiSchema<"TopicDetailResponse">, "topic" | "events"> & {
  topic: Topic;
  events: TopicEvent[];
};
