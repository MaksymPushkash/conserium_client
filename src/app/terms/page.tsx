import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <Link href="/" className="text-sm text-neutral-500 hover:text-white">CORTEX</Link>
          <h1 className="text-4xl font-normal tracking-normal">Terms of Service</h1>
          <p className="font-jetbrains text-xs text-neutral-500">Last updated: May 15, 2026</p>
        </header>

        <section className="space-y-4 text-sm leading-7 text-neutral-300">
          <p>You are responsible for the content you upload, save, sync, or generate through Cortex.</p>
          <p>Cortex provides source-grounded AI workflows, but generated outputs can be incomplete or wrong and should be reviewed before relying on them.</p>
          <p>You must not use Cortex to store or process content you do not have the right to use.</p>
          <p>The service may change as product features, infrastructure, and integrations evolve.</p>
        </section>
      </div>
    </main>
  );
}
