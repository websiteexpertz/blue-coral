'use client';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  accent?: string;
}

export default function DashboardCard({
  title,
  value,
  description,
  accent = 'bg-primary/10 text-primary',
}: DashboardCardProps) {
  return (
    <div
      className={`rounded-[1.75rem] border border-white/10 bg-white/95 p-6 shadow-[0_24px_80px_rgba(27,79,107,0.06)] transition ${accent}`}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p className="mt-4 text-4xl font-semibold text-foreground">{value}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
