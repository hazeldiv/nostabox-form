"use client";

import { useRef } from "react";

import Link from "next/link";

import { Search, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { controlClass } from "@/components/field";
import { hasActiveFilters, type OrderFilters } from "@/lib/orders";

type FilterBarProps = {
  actionPath: string;
  filters: OrderFilters;
};

const selectClass =
  "h-11 w-full cursor-pointer rounded-control border border-line bg-surface px-3 text-[14px] font-semibold text-ink transition-colors duration-200 hover:border-line-strong";

export function FilterBar({ actionPath, filters }: FilterBarProps) {
  const formRef = useRef<HTMLFormElement>(null);

  function submit() {
    formRef.current?.requestSubmit();
  }

  return (
    <form
      ref={formRef}
      action={actionPath}
      method="get"
      className="mt-4 rounded-card border border-line bg-surface p-3 sm:p-3.5"
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="q" className="sr-only">
              Search orders
            </label>
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
              strokeWidth={2.5}
            />
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={filters.search}
              placeholder="Search name, order ID, or WhatsApp"
              className={cn(controlClass(false), "h-11 pl-10 text-[14px]")}
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-control bg-ink px-4 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-ink-soft"
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label htmlFor="metode" className="sr-only">
              Method
            </label>
            <select
              id="metode"
              name="metode"
              defaultValue={filters.metode}
              onChange={submit}
              className={cn(selectClass, "px-2.5 text-[13px]")}
            >
              <option value="">All</option>
              <option value="Pickup">Pickup</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="sr-only">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={filters.status}
              onChange={submit}
              className={cn(selectClass, "px-2.5 text-[13px]")}
            >
              <option value="">All</option>
              <option value="baru">New</option>
              <option value="dibayar">Paid</option>
              <option value="selesai">Done</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort" className="sr-only">
              Sort
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={filters.sort}
              onChange={submit}
              className={cn(selectClass, "px-2.5 text-[13px]")}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {hasActiveFilters(filters) ? (
        <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-line pt-2.5">
          <p className="text-[12px] text-muted">
            Filters active — results are narrowed by the options above.
          </p>
          <Link
            href={actionPath}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-[12px] font-semibold text-ink underline decoration-line underline-offset-2 transition-colors duration-200 hover:decoration-ink"
          >
            <X aria-hidden className="size-3.5" strokeWidth={2.5} />
            Reset
          </Link>
        </div>
      ) : null}
    </form>
  );
}
