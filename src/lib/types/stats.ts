import type { components } from "@/lib/api/generated/v1";

type Schemas = components["schemas"];

export type StatsOverviewResponse = Schemas["StatsOverviewResponse"];
export type StatsTimelineBucket = Schemas["StatsTimelineBucketResponse"];
export type StatsTimelineResponse = Schemas["StatsTimelineResponse"];
export type DailyDigestItem = Schemas["DailyDigestItemResponse"];
export type DailyDigestResponse = Schemas["DailyDigestResponse"];
export type WeeklyReportResponse = Schemas["WeeklyReportResponse"];
