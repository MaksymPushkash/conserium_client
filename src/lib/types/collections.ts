import type { ApiSchema } from "./generated";

export type Collection = ApiSchema<"CollectionResponse">;
export type CollectionListResponse = ApiSchema<"CollectionListResponse">;
export type CollectionWorkspaceStats = ApiSchema<"CollectionWorkspaceStatsResponse">;
export type CollectionWorkspaceDocument = ApiSchema<"CollectionWorkspaceDocumentResponse">;
export type CollectionWorkspaceTopic = ApiSchema<"CollectionWorkspaceTopicResponse">;
export type CollectionWorkspaceGap = ApiSchema<"CollectionWorkspaceGapResponse">;
export type CollectionWorkspaceQuestion = ApiSchema<"CollectionWorkspaceQuestionResponse">;
export type CollectionWorkspaceDraft = ApiSchema<"CollectionWorkspaceDraftResponse">;
export type CollectionWorkspaceComparison = ApiSchema<"CollectionWorkspaceComparisonResponse">;
export type CollectionWorkspace = ApiSchema<"CollectionWorkspaceResponse">;

export type CollectionShare = ApiSchema<"CollectionShareResponse">;
export type PublicAskEvent = ApiSchema<"PublicAskEventResponse">;
export type PublicAskEventListResponse = ApiSchema<"PublicAskEventListResponse">;
export type PublicCollectionDocument = ApiSchema<"PublicCollectionDocumentResponse">;
export type PublicCollectionResponse = ApiSchema<"PublicCollectionResponse">;

export type CollectionMemberRole = ApiSchema<"CollectionMemberResponse">["role"];
export type CollectionMember = ApiSchema<"CollectionMemberResponse">;
export type CollectionMemberListResponse = ApiSchema<"CollectionMemberListResponse">;
export type CollectionAuditEvent = ApiSchema<"CollectionAuditEventResponse">;
export type CollectionAuditEventListResponse = ApiSchema<"CollectionAuditEventListResponse">;

export type Workspace = ApiSchema<"WorkspaceResponse">;
export type WorkspaceListResponse = ApiSchema<"WorkspaceListResponse">;
export type WorkspaceMember = ApiSchema<"WorkspaceMemberResponse">;
export type WorkspaceMemberListResponse = ApiSchema<"WorkspaceMemberListResponse">;
export type WorkspaceAuditEvent = ApiSchema<"WorkspaceAuditEventResponse">;
export type WorkspaceAuditEventListResponse = ApiSchema<"WorkspaceAuditEventListResponse">;
