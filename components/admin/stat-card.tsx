import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
};

export function StatCard({ label, value, hint, emphasis }: StatCardProps) {
  return (
    <div
      className={
        emphasis
          ? "rounded-card border border-ink/10 bg-ink px-4 py-3.5 text-white"
          : "rounded-card border border-line bg-surface px-4 py-3.5"
      }
    >
      <p
        className={
          emphasis
            ? "text-[10px] font-bold uppercase tracking-[0.16em] text-white/60"
            : "text-[10px] font-bold uppercase tracking-[0.16em] text-muted"
        }
      >
        {label}
      </p>
      <p
        className={
          emphasis
            ? "mt-1 font-heading text-[22px] leading-none tabular-nums text-white sm:text-[26px]"
            : "mt-1 font-heading text-[22px] leading-none tabular-nums text-ink sm:text-[26px]"
        }
      >
        {value}
      </p>
      {hint ? (
        <p
          className={
            emphasis
              ? "mt-1.5 text-[11px] leading-snug text-white/60"
              : "mt-1.5 text-[11px] leading-snug text-muted"
          }
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">{children}</div>;
}
