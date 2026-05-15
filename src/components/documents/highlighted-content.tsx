"use client";

interface HighlightedContentProps {
  content: string | null;
  start: number | null | undefined;
  end: number | null | undefined;
}

export function HighlightedContent({ content, start, end }: HighlightedContentProps) {
  if (!content) {
    return <pre className="whitespace-pre-wrap text-sm leading-7 text-white">No raw content returned.</pre>;
  }
  const contentClassName = "whitespace-pre-wrap break-words text-sm leading-7 text-white [overflow-wrap:anywhere]";
  if (start === null || start === undefined || end === null || end === undefined || start < 0 || end <= start) {
    return (
      <div className="max-h-[65vh] overflow-auto pr-2">
        <pre className={contentClassName}>{content}</pre>
      </div>
    );
  }
  return (
    <div className="max-h-[65vh] overflow-auto pr-2">
      <pre className={contentClassName}>
        {content.slice(0, start)}
        <mark className="rounded bg-yellow-300 px-1 text-black">{content.slice(start, end)}</mark>
        {content.slice(end)}
      </pre>
    </div>
  );
}
