import type { ReactNode } from "react";

import { Plus } from "lucide-react";

import { cn } from "@/lib/cn";

export type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
  swatch?: string;
  icon?: ReactNode;
};

type OptionGroupProps<T extends string> = {
  name: string;
  options: ReadonlyArray<Option<T>>;
  value: T | undefined;
  onChange: (value: T) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
  layout: "cards" | "chips";
  className?: string;
};

function optionId(name: string, value: string): string {
  return `${name}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function OptionGroup<T extends string>({
  name,
  options,
  value,
  onChange,
  onBlur,
  invalid,
  describedBy,
  layout,
  className,
}: OptionGroupProps<T>) {
  return (
    <div
      className={cn(
        layout === "cards" ? "grid gap-2.5 sm:grid-cols-2" : "flex flex-wrap gap-2",
        className,
      )}
    >
      {options.map((option) => {
        const id = optionId(name, option.value);
        const active = value === option.value;

        return (
          <label
            key={option.value}
            htmlFor={id}
            className={cn("cursor-pointer", layout === "cards" && "block")}
          >
            <input
              type="radio"
              id={id}
              name={name}
              value={option.value}
              checked={active}
              onChange={() => onChange(option.value)}
              onBlur={onBlur}
              aria-invalid={invalid ? true : undefined}
              aria-describedby={describedBy}
              className="peer sr-only"
            />
            {layout === "cards" ? (
              <span
                className={cn(
                  "flex h-full flex-col gap-1 rounded-control border p-4 transition-colors duration-200",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2",
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-surface text-ink hover:border-line-strong",
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-heading text-[16px] leading-tight">{option.label}</span>
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-full border transition-colors duration-200",
                      active ? "border-white" : "border-line-strong",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full transition-colors duration-200",
                        active ? "bg-white" : "bg-transparent",
                      )}
                    />
                  </span>
                </span>
                {option.description ? (
                  <span
                    className={cn(
                      "text-[13px] leading-snug",
                      active ? "text-white/75" : "text-muted",
                    )}
                  >
                    {option.description}
                  </span>
                ) : null}
              </span>
            ) : (
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-semibold transition-colors duration-200",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2",
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink",
                )}
              >
                {option.swatch ? (
                  <span
                    aria-hidden
                    style={{ backgroundColor: option.swatch }}
                    className="size-3 shrink-0 rounded-full ring-1 ring-black/10"
                  />
                ) : null}
                {option.icon}
                {option.label}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

export function CustomOptionIcon() {
  return <Plus aria-hidden className="size-3.5" strokeWidth={2.5} />;
}
