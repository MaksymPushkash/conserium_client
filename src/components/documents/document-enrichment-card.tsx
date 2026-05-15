import { JsonBlock, SuggestedQuestions, TagBlock } from "@/components/documents/document-metadata";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocumentResponse } from "@/lib/types";

interface DocumentEnrichmentCardProps {
  document: DocumentResponse;
}

export function DocumentEnrichmentCard({ document }: DocumentEnrichmentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrichment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TagBlock title="Tags" values={document.tags} />
        <SuggestedQuestions values={document.suggested_questions} />
        <JsonBlock title="Entities" value={document.entities} />
        <JsonBlock title="Categories" value={document.categories} />
        <JsonBlock title="Visual metadata" value={document.visual_metadata} />
      </CardContent>
    </Card>
  );
}
