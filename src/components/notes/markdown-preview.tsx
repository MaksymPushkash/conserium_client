import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownPreview({ title, content }: { title?: string | null; content?: string | null }) {
  const safeTitle = title ?? "";
  const safeContent = content ?? "";

  return (
    <article className="min-h-[62vh] text-neutral-100">
      <h1 className="text-3xl font-light tracking-normal text-white">{safeTitle.trim() || "Untitled"}</h1>
      {safeContent.trim() ? (
        <div className="mt-10 space-y-4 text-sm font-light leading-8 text-neutral-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="text-2xl font-light leading-10 text-white">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-light leading-9 text-white">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-light leading-8 text-white">{children}</h3>,
              p: ({ children }) => <p className="leading-8 text-neutral-200">{children}</p>,
              a: ({ children, href }) => <a href={href} className="text-white underline decoration-white/30 underline-offset-4">{children}</a>,
              ul: ({ children }) => <ul className="list-disc space-y-2 pl-6">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal space-y-2 pl-6">{children}</ol>,
              li: ({ children }) => <li className="pl-1">{children}</li>,
              blockquote: ({ children }) => <blockquote className="border-l border-white/20 pl-4 text-neutral-400">{children}</blockquote>,
              hr: () => <hr className="border-white/10" />,
              code: ({ children }) => <code className="font-jetbrains rounded border border-white/10 bg-black px-1.5 py-0.5 text-xs text-neutral-300">{children}</code>,
              pre: ({ children }) => <pre className="font-jetbrains overflow-auto rounded-lg border border-white/10 bg-black p-4 text-xs leading-6 text-neutral-300">{children}</pre>,
              table: ({ children }) => <div className="overflow-auto"><table className="w-full border-collapse text-left text-xs">{children}</table></div>,
              th: ({ children }) => <th className="border border-white/10 px-3 py-2 text-neutral-300">{children}</th>,
              td: ({ children }) => <td className="border border-white/10 px-3 py-2 text-neutral-400">{children}</td>,
            }}
          >
            {safeContent}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="font-jetbrains mt-10 rounded-lg border border-white/10 bg-white/[0.02] p-6 text-sm font-light leading-6 text-neutral-500">
          Nothing to preview yet. Switch to Edit and start writing.
        </div>
      )}
    </article>
  );
}
