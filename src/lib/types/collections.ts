import type { DocumentStatus, DocumentType } from "./documents";
import type { ApiSchema, RequiredApiFields } from "./generated";

export type Collection = ApiSchema<"CollectionResponse">;
export type CollectionListResponse = ApiSchema<"CollectionListResponse">;
export type CollectionWorkspaceStats = ApiSchema<"CollectionWorkspaceStatsResponse">;
export type CollectionWorkspaceDocument = Omit<
  ApiSchema<"CollectionWorkspaceDocumentResponse">,
  "status" | "type"
> & {
  type: DocumentType | string;
  status: DocumentStatus | string;
};
export type CollectionWorkspaceTopic = ApiSchema<"CollectionWorkspaceTopicResponse">;
export type CollectionWorkspaceGap = RequiredApiFields<
  ApiSchema<"CollectionWorkspaceGapResponse">,
  "coverage_ratio" | "id" | "missing_source_types" | "suggested_actions" | "topic"
>;
export type CollectionWorkspaceQuestion = ApiSchema<"CollectionWorkspaceQuestionResponse">;
export type CollectionWorkspaceDraft = ApiSchema<"CollectionWorkspaceDraftResponse">;
export type CollectionWorkspaceComparison = ApiSchema<"CollectionWorkspaceComparisonResponse">;
type NormalizedCollectionWorkspace = RequiredApiFields<
  ApiSchema<"CollectionWorkspaceResponse">,
  "recent_comparisons" | "recent_drafts"
>;
export type CollectionWorkspace = Omit<
  NormalizedCollectionWorkspace,
  "collection" | "documents" | "gaps" | "recent_comparisons" | "recent_drafts" | "recent_questions" | "stats" | "topics"
> & {
  collection: Collection;
  stats: CollectionWorkspaceStats;
  documents: CollectionWorkspaceDocument[];
  topics: CollectionWorkspaceTopic[];
  gaps: CollectionWorkspaceGap[];
  recent_questions: CollectionWorkspaceQuestion[];
  recent_drafts: CollectionWorkspaceDraft[];
  recent_comparisons: CollectionWorkspaceComparison[];
};

export type CollectionShare = ApiSchema<"CollectionShareResponse">;
export type PublicAskEvent = ApiSchema<"PublicAskEventResponse">;
export type PublicAskEventListResponse = RequiredApiFields<ApiSchema<"PublicAskEventListResponse">, "items">;
export type PublicCollectionDocument = Omit<
  RequiredApiFields<ApiSchema<"PublicCollectionDocumentResponse">, "tags">,
  "status" | "type"
> & {
  type: DocumentType;
  status: DocumentStatus;
};
export type PublicCollectionResponse = Omit<
  RequiredApiFields<ApiSchema<"PublicCollectionResponse">, "documents">,
  "documents"
> & { documents: PublicCollectionDocument[] };

export type CollectionMemberRole = "viewer" | "editor";
export type CollectionMember = Omit<ApiSchema<"CollectionMemberResponse">, "role"> & {
  role: CollectionMemberRole;
  invite_status: "active";
};
export type CollectionMemberListResponse = Omit<ApiSchema<"CollectionMemberListResponse">, "items"> & {
  items: CollectionMember[];
};
export type CollectionAuditEvent = ApiSchema<"CollectionAuditEventResponse">;
export type CollectionAuditEventListResponse = ApiSchema<"CollectionAuditEventListResponse">;

export type Workspace = ApiSchema<"WorkspaceResponse">;
export type WorkspaceListResponse = ApiSchema<"WorkspaceListResponse">;
export type WorkspaceMember = Omit<ApiSchema<"WorkspaceMemberResponse">, "role"> & {
  role: CollectionMemberRole;
};
export type WorkspaceMemberListResponse = Omit<ApiSchema<"WorkspaceMemberListResponse">, "items"> & {
  items: WorkspaceMember[];
};
export type WorkspaceAuditEvent = ApiSchema<"WorkspaceAuditEventResponse">;
export type WorkspaceAuditEventListResponse = ApiSchema<"WorkspaceAuditEventListResponse">;
