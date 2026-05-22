"use client";

import { RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { Collection, DocumentType } from "@/lib/types";

export interface GraphFiltersValue {
  collectionId: string;
  tag: string;
  topic: string;
  documentType: string;
  recencyDays: string;
}

interface GraphFiltersProps {
  value: GraphFiltersValue;
  collections: Collection[];
  topics: string[];
  onChange: (value: GraphFiltersValue) => void;
  onReset: () => void;
}

const documentTypes: DocumentType[] = ["PDF", "URL", "YOUTUBE", "IMAGE", "TEXT", "MARKDOWN"];
const recencyOptions = [
  { label: "Any time", value: "" },
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
  { label: "1 year", value: "365" },
];

export function GraphFilters({ value, collections, topics, onChange, onReset }: GraphFiltersProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="font-jetbrains text-xs uppercase tracking-[0.16em] text-neutral-500">Filters</div>
          <div className="mt-1 text-sm text-neutral-300">Scope graph retrieval</div>
        </div>
        <Button variant="ghost" size="icon" onClick={onReset} aria-label="Reset graph filters">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-3">
        <SelectField
          label="Collection"
          value={value.collectionId}
          onChange={(collectionId) => onChange({ ...value, collectionId })}
        >
          <option value="">All collections</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </SelectField>
        <SelectField label="Topic" value={value.topic} onChange={(topic) => onChange({ ...value, topic })}>
          <option value="">All topics</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </SelectField>
        <input
          value={value.tag}
          onChange={(event) => onChange({ ...value, tag: event.target.value })}
          placeholder="Filter by tag"
          className="h-9 rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none placeholder:text-neutral-700"
          aria-label="Tag filter"
        />
        <SelectField
          label="Type"
          value={value.documentType}
          onChange={(documentType) => onChange({ ...value, documentType })}
        >
          <option value="">All types</option>
          {documentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Recency"
          value={value.recencyDays}
          onChange={(recencyDays) => onChange({ ...value, recencyDays })}
        >
          {recencyOptions.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1">
      <span className="font-jetbrains text-xs uppercase tracking-[0.14em] text-neutral-600">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none"
      >
        {children}
      </select>
    </label>
  );
}
