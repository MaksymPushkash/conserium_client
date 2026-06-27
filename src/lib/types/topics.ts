import type { ApiSchema } from "./generated";

export type Topic = ApiSchema<"TopicResponse">;
export type TopicDocument = ApiSchema<"TopicDocumentResponse">;
export type TopicEvent = ApiSchema<"TopicEventResponse">;
export type TopicListResponse = ApiSchema<"TopicListResponse">;
export type TopicDetailResponse = ApiSchema<"TopicDetailResponse">;
