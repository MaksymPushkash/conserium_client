export interface ConflictDocument {
  id: string;
  title: string;
}

export interface ConflictFinding {
  subject: string;
  summary: string;
  documents: ConflictDocument[];
  evidence: string[];
  score: number;
}

export interface ConflictDetectionResponse {
  collection_id: string | null;
  analyzed_document_count: number;
  conflicts: ConflictFinding[];
}
