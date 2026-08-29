export default function AppLoading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background px-6"
      aria-live="polite"
      role="status"
    >
      <div className="flex flex-col items-center gap-4 rounded-[28px] border border-border bg-white/90 px-8 py-10 shadow-[0_32px_80px_rgba(27,79,107,0.08)] backdrop-blur-sm">
        <span
          className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary/25 border-t-primary"
          aria-hidden="true"
        />
        <div className="text-center">
          <p className="label-caps text-primary">Loading</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Please wait while we prepare the villa experience.
          </p>
        </div>
      </div>
    </main>
  );
}
