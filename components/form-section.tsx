import type { ReactNode } from "react";

type FormSectionProps = {
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormSection({ step, title, description, children }: FormSectionProps) {
  return (
    <section className="border-t border-line pt-7 first:border-t-0 first:pt-0">
      <div className="flex items-baseline gap-3">
        <span className="font-heading text-[13px] tabular-nums text-muted">
          {String(step).padStart(2, "0")}
        </span>
        <h2 className="text-[19px]">{title}</h2>
      </div>
      {description ? (
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{description}</p>
      ) : null}
      <div className="mt-5 space-y-6">{children}</div>
    </section>
  );
}
