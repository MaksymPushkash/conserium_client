export interface StatsOverviewResponse {
  total_documents: number;
  ready_documents: number;
  processing_documents: number;
  failed_documents: number;
  hot_documents: number;
  cold_documents: number;
  forgotten_documents: number;
  active_documents: number;
  query_count: number;
  citation_count: number;
}

export interface StatsTimelineBucket {
  month: string;
  saved_documents: number;
  active_documents: number;
  query_count: number;
  citation_count: number;
}

export interface StatsTimelineResponse {
  items: StatsTimelineBucket[];
  months: number;
}

export interface DailyDigestItem {
  document_id: string;
  title: string;
  summary: string | null;
  question: string;
  reason: string;
  last_used_at: string;
  days_since_activity: number;
}

export interface DailyDigestResponse {
  items: DailyDigestItem[];
}

export interface WeeklyReportResponse {
  saved_documents: number;
  active_documents: number;
  query_count: number;
  citation_count: number;
  ready_documents: number;
  failed_documents: number;
  stale_documents: number;
  summary: string;
  recommended_actions: string[];
}
