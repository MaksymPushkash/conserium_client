export function ErrorBanner({ message }: { message: string }) {
  return <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{message}</div>;
}
