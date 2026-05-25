export interface ObservabilitySummary {
  query_latency: { count: number; average_seconds: number };
  retrieval: { hit_rate: number; requests: number; hits: number };
  documents: { failed_processing_count: number };
  openai: { estimated_cost_usd: number };
  queues: Record<string, number>;
}
