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
