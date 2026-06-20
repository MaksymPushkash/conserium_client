"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FileUp, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ingestText, uploadDocument } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";

type DropStatus = {
  active: boolean;
  uploading: boolean;
  message: string | null;
  error: string | null;
};

const initialStatus: DropStatus = {
  active: false,
  uploading: false,
  message: null,
  error: null,
};

export function GlobalDropIngest() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<DropStatus>(initialStatus);

  useEffect(() => {
    function onDragOver(event: DragEvent) {
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      setStatus((current) => ({ ...current, active: true }));
    }

    function onDragLeave(event: DragEvent) {
      if (event.clientX !== 0 || event.clientY !== 0) return;
      setStatus((current) => ({ ...current, active: false }));
    }

    function onDrop(event: DragEvent) {
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      void handleDroppedFiles(Array.from(event.dataTransfer.files));
    }

    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  async function handleDroppedFiles(files: File[]) {
    if (!files.length) {
      setStatus((current) => ({ ...current, active: false }));
      return;
    }
    setStatus({ active: false, uploading: true, message: `Uploading ${files.length} file${files.length === 1 ? "" : "s"}...`, error: null });
    try {
      const acceptedFiles = await uploadFiles(files);
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      setStatus({
        active: false,
        uploading: false,
        message: `${acceptedFiles} file${acceptedFiles === 1 ? "" : "s"} queued`,
        error: null,
      });
    } catch (error) {
      setStatus({ active: false, uploading: false, message: null, error: errorMessage(error) });
    }
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {status.active ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center border-2 border-dashed border-white/30 bg-black/70 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-neutral-950 px-5 py-4 text-sm text-neutral-300 shadow-2xl">
            <FileUp className="h-5 w-5" />
            <span>Drop files to ingest</span>
          </div>
        </div>
      ) : null}

      {status.message || status.error || status.uploading ? (
        <div className="pointer-events-auto absolute bottom-4 right-4 flex max-w-sm items-center gap-3 rounded-lg border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-neutral-300 shadow-2xl">
          {status.uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
          <span className={status.error ? "text-neutral-400" : ""}>{status.error ?? status.message}</span>
          <Button variant="ghost" size="icon" onClick={() => setStatus(initialStatus)} aria-label="Dismiss upload status">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

async function uploadFiles(files: File[]): Promise<number> {
  let acceptedFiles = 0;
  for (const file of files) {
    if (file.type === "application/pdf" || file.type.startsWith("image/")) {
      await uploadDocument(file);
      acceptedFiles += 1;
      continue;
    }
    if (file.type.startsWith("text/") || file.name.endsWith(".md") || file.name.endsWith(".markdown")) {
      await ingestText({ title: file.name, content: await file.text() });
      acceptedFiles += 1;
    }
  }
  if (!acceptedFiles) {
    throw new Error("Only PDF, image, text, and markdown files are supported.");
  }
  return acceptedFiles;
}
