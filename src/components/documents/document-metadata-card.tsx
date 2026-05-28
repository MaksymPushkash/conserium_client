import { Row } from "@/components/documents/document-metadata";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Collection, DocumentResponse } from "@/lib/types";

interface DocumentMetadataCardProps {
  document: DocumentResponse;
  collections: Collection[];
  onMove: (collectionId: string | null) => void;
}

export function DocumentMetadataCard({ document, collections, onMove }: DocumentMetadataCardProps) {
  const sourceLabel = readableSourceLabel(document);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Row label="word count" value={String(document.word_count ?? "-")} />
        <Row label="source" value={sourceLabel} />
        <div className="grid min-w-0 grid-cols-[100px_minmax(0,1fr)] gap-5 border-b border-white/10 pb-3">
          <div className="font-jetbrains text-neutral-500">collection</div>
          <select
            className="h-9 min-w-0 rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-neutral-300 outline-none"
            value={document.collection_id ?? ""}
            onChange={(event) => onMove(event.target.value || null)}
          >
            <option value="" className="bg-black text-neutral-200">
              None
            </option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id} className="bg-black text-neutral-200">
                {collection.name}
              </option>
            ))}
          </select>
        </div>
        <Row label="duplicate" value={document.is_duplicate ? `yes · ${document.duplicate_of_id}` : "no"} />
      </CardContent>
    </Card>
  );
}

function readableSourceLabel(document: DocumentResponse): string {
  if (document.source_url) return document.source_url;
  if (!document.file_path) return document.type === "TEXT" ? "Text entry" : "Uploaded file";
  const filename = document.file_path.split("/").filter(Boolean).at(-1) ?? "";
  const looksLikeStoredUuid = /^[0-9a-f-]{24,}(\.[a-z0-9]+)?$/i.test(filename);
  return looksLikeStoredUuid ? "Uploaded file" : filename || "Uploaded file";
}
