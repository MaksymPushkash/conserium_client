"use client";

import { Input } from "@/components/ui/input";
import { documentStatusOptions, documentTypeOptions } from "@/hooks/use-document-filters";
import type { Collection, DocumentStatus, DocumentType } from "@/lib/types";

interface DocumentsFilterToolbarProps {
  search: string;
  type: DocumentType | "ALL";
  status: DocumentStatus | "ALL";
  collectionId: string | "ALL";
  tag: string | "ALL";
  collections: Collection[];
  availableTags: string[];
  onSearchChange: (value: string) => void;
  onTypeChange: (value: DocumentType | "ALL") => void;
  onStatusChange: (value: DocumentStatus | "ALL") => void;
  onCollectionChange: (value: string | "ALL") => void;
  onTagChange: (value: string | "ALL") => void;
}

export function DocumentsFilterToolbar({
  search,
  type,
  status,
  collectionId,
  tag,
  collections,
  availableTags,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onCollectionChange,
  onTagChange,
}: DocumentsFilterToolbarProps) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_220px_180px]">
      <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search by meaning" className="font-jetbrains" />
      <select className={selectClassName} value={type} onChange={(event) => onTypeChange(event.target.value as DocumentType | "ALL")}>
        {documentTypeOptions.map((option) => <option key={option} className="bg-black text-neutral-200">{option}</option>)}
      </select>
      <select className={selectClassName} value={status} onChange={(event) => onStatusChange(event.target.value as DocumentStatus | "ALL")}>
        {documentStatusOptions.map((option) => <option key={option} className="bg-black text-neutral-200">{option}</option>)}
      </select>
      <select className={selectClassName} value={collectionId} onChange={(event) => onCollectionChange(event.target.value as string | "ALL")}>
        <option value="ALL" className="bg-black text-neutral-200">All collections</option>
        {collections.map((collection) => (
          <option key={collection.id} value={collection.id} className="bg-black text-neutral-200">{collection.name}</option>
        ))}
      </select>
      <select className={selectClassName} value={tag} onChange={(event) => onTagChange(event.target.value as string | "ALL")}>
        <option value="ALL" className="bg-black text-neutral-200">All tags</option>
        {availableTags.map((availableTag) => (
          <option key={availableTag} value={availableTag} className="bg-black text-neutral-200">{availableTag}</option>
        ))}
      </select>
    </div>
  );
}

const selectClassName = "h-10 rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-neutral-300 outline-none transition-colors focus:border-white/40";
