export function RouteLoading({ title = "Loading" }: { title?: string }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div>
        <div className="h-8 w-44 animate-pulse rounded-md bg-white/10" aria-label={title} />
        <div className="mt-3 h-4 w-72 animate-pulse rounded-md bg-white/[0.06]" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-xl border border-white/10 bg-white/[0.025]" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]" />
    </div>
  );
}
