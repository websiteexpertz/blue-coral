'use client';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-muted/50 p-8 text-center text-sm text-muted-foreground">
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description ? <p className="mt-2 leading-relaxed">{description}</p> : null}
    </div>
  );
}
