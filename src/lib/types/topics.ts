export interface Topic {
  name: string;
  document_count: number;
  last_document_at: string | null;
  source_names: string[];
  pinned: boolean;
  ignored: boolean;
}

export interface TopicListResponse {
  items: Topic[];
  total: number;
  limit: number;
  offset: number;
}

export interface TopicDocument {
  id: string;
  title: string;
  type: string;
  status: string;
  summary: string | null;
  created_at: string;
}

export interface TopicEvent {
  action: string;
  topic_name: string;
  display_name: string | null;
  source_names: string[];
  created_at: string;
}

export interface TopicDetailResponse {
  topic: Topic;
  documents: TopicDocument[];
  events: TopicEvent[];
}
