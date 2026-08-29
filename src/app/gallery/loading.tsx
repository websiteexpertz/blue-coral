export default function GalleryLoading() {
  return (
    <main
      className="min-h-screen bg-background px-6 py-24 lg:px-10"
      aria-live="polite"
      role="status"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 rounded-[28px] border border-border bg-white/90 p-8 shadow-[0_32px_80px_rgba(27,79,107,0.08)] backdrop-blur-sm">
          <div className="h-3 w-24 rounded-full bg-muted/80" />
          <div className="mt-4 h-12 w-72 max-w-full rounded-[16px] bg-muted/80" />
          <div className="mt-4 h-5 w-full max-w-2xl rounded-full bg-muted/70" />
          <div className="mt-2 h-5 w-2/3 rounded-full bg-muted/70" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-[24px] border border-border bg-muted/70"
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          Loading gallery...
        </div>
      </div>
    </main>
  );
}
