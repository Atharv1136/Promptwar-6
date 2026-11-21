export default function HomePage() {
  return (
    <main id="main-content" className="space-y-8">
      <header className="border-b border-rule pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Saans — Winter Smog Companion
        </h1>
        <p className="text-ink-muted text-sm mt-1">
          A smart air-quality and low-emission assistant for families and communities.
        </p>
      </header>

      <section aria-labelledby="intro-heading" className="space-y-4">
        <h2 id="intro-heading" className="text-lg font-semibold">
          Phase 0 Repository Scaffolding Complete
        </h2>
        <p className="text-sm text-ink-muted">
          All domain foundations, security boundaries, and strict type checking are initialized.
        </p>
      </section>
    </main>
  );
}
