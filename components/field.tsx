import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/cn";

export function controlClass(invalid: boolean): string {
  return cn(
    "w-full rounded-control border bg-surface px-3.5 py-2.5 text-[15px] leading-normal text-ink",
    "transition-colors duration-200 placeholder:text-muted/70",
    invalid
      ? "border-danger/50 hover:border-danger/70"
      : "border-line hover:border-line-strong focus:border-ink",
  );
}

type LabelProps = {
  htmlFor: string;
  children: ReactNode;
  optional?: boolean;
};

export function FieldLabel({ htmlFor, children, optional }: LabelProps) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-[15px] font-semibold text-ink">
        {children}
      </label>
      {optional ? (
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Opsional
        </span>
      ) : null}
    </div>
  );
}

export function FieldHint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1 text-[13px] leading-relaxed text-muted">
      {children}
    </p>
  );
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-2 flex items-start gap-1.5 text-[13px] font-semibold leading-relaxed text-danger"
    >
      <AlertCircle aria-hidden className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.5} />
      <span>{children}</span>
    </p>
  );
}

function describedBy(id: string, hint?: ReactNode, error?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);

  return ids.length > 0 ? ids.join(" ") : undefined;
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
};

export function TextField({
  id,
  label,
  hint,
  error,
  optional,
  className,
  ...props
}: TextFieldProps) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} optional={optional}>
        {label}
      </FieldLabel>
      {hint ? <FieldHint id={`${id}-hint`}>{hint}</FieldHint> : null}
      <div className="mt-2.5">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={controlClass(Boolean(error))}
          {...props}
        />
      </div>
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  );
}

type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
};

export function TextAreaField({
  id,
  label,
  hint,
  error,
  optional,
  className,
  rows = 3,
  ...props
}: TextAreaFieldProps) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} optional={optional}>
        {label}
      </FieldLabel>
      {hint ? <FieldHint id={`${id}-hint`}>{hint}</FieldHint> : null}
      <div className="mt-2.5">
        <textarea
          id={id}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(controlClass(Boolean(error)), "min-h-[92px]")}
          {...props}
        />
      </div>
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  );
}

type FieldGroupProps = {
  id: string;
  legend: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

export function FieldGroup({
  id,
  legend,
  hint,
  error,
  optional,
  className,
  children,
}: FieldGroupProps) {
  return (
    <fieldset
      id={id}
      aria-describedby={describedBy(id, hint, error)}
      className={cn("min-w-0", className)}
    >
      <legend className="flex w-full items-baseline justify-between gap-3 text-[15px] font-semibold text-ink">
        <span>{legend}</span>
        {optional ? (
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Opsional
          </span>
        ) : null}
      </legend>
      {hint ? <FieldHint id={`${id}-hint`}>{hint}</FieldHint> : null}
      <div className="mt-2.5">{children}</div>
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </fieldset>
  );
}
