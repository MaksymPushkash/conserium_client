export function ErrorBanner({ message }: { message: string }) {
  return <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">{message}</div>;
}
