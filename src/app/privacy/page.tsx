import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <Link href="/" className="text-sm text-neutral-500 hover:text-white">CORTEX</Link>
          <h1 className="text-4xl font-normal tracking-normal">Privacy Policy</h1>
          <p className="font-jetbrains text-xs text-neutral-500">Last updated: May 15, 2026</p>
        </header>

        <section className="space-y-4 text-sm leading-7 text-neutral-300">
          <p>Cortex stores the documents, notes, links, metadata, chats, and account data you add to your workspace.</p>
          <p>Private workspace content is not public unless a future sharing feature explicitly lets you publish selected collections.</p>
          <p>AI features process your saved content to generate embeddings, summaries, answers, citations, and enrichment metadata.</p>
          <p>Account controls and privacy preferences are available in Settings. Deleting your account removes account-owned workspace data through the backend account deletion flow.</p>
        </section>
      </div>
    </main>
  );
}
