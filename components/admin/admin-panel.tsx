import Image from "next/image";

import Link from "next/link";

import { ChevronLeft, ChevronRight, Download } from "lucide-react";

import { FilterBar } from "@/components/admin/filter-bar";
import { LogoutButton } from "@/components/admin/logout-button";
import { OrdersView } from "@/components/admin/orders-view";
import { StatCard, StatGrid } from "@/components/admin/stat-card";
import logo from "@/public/logo.png";

import { formatRupiah } from "@/lib/format";
import { filtersToQuery, type OrderFilters, type OrderList, type OrderStats } from "@/lib/orders";

type PanelProps = {
  token: string;
  filters: OrderFilters;
  stats: OrderStats;
  list: OrderList;
};

function pageHref(token: string, filters: OrderFilters, page: number): string {
  const query = filtersToQuery({ ...filters, page });

  return query ? `/admin/${token}?${query}` : `/admin/${token}`;
}

export function AdminPanel({ token, filters, stats, list }: PanelProps) {
  const actionPath = `/admin/${token}`;
  const exportQuery = filtersToQuery({ ...filters, page: 1 });
  const exportHref = exportQuery ? `${actionPath}/export?${exportQuery}` : `${actionPath}/export`;
  const pageCount = Math.max(1, Math.ceil(list.count / filters.perPage));
  const hasPrev = filters.page > 1;
  const hasNext = filters.page < pageCount;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-3 sm:px-6">
          <Image
            src={logo}
            alt="Nostabox"
            priority
            sizes="40px"
            className="h-9 w-9 shrink-0 object-contain mix-blend-multiply"
          />
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Nostabox</p>
            <h1 className="truncate text-[18px] leading-tight">Orders</h1>
          </div>
          <span className="ml-1 hidden shrink-0 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold tabular-nums text-ink-soft sm:inline-flex">
            {stats.orders} orders
          </span>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <a
              href={exportHref}
              className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-control bg-ink px-3 text-[12px] font-semibold text-white transition-colors duration-200 hover:bg-ink-soft"
            >
              <Download aria-hidden className="size-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Excel</span>
            </a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 sm:py-6">
        <StatGrid>
          <StatCard label="Total orders" value={String(stats.orders)} hint="All orders received" />
          <StatCard label="Total pcs" value={String(stats.pcs)} hint="Slimes sold" />
          <StatCard label="Revenue" value={formatRupiah(stats.revenue)} hint="Excludes delivery" emphasis />
          <StatCard
            label="Needs action"
            value={String(stats.pending)}
            hint={
              stats.withoutProof > 0
                ? `${stats.withoutProof} orders without payment proof`
                : "All payment proofs received"
            }
          />
        </StatGrid>

        <FilterBar actionPath={actionPath} filters={filters} />

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[12px] text-muted">
            Showing {list.rows.length} of {list.count} orders
          </p>
          <p className="text-[12px] text-muted">
            Page {filters.page} / {pageCount}
          </p>
        </div>

        <OrdersView rows={list.rows} />

        {pageCount > 1 ? (
          <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3">
            {hasPrev ? (
              <Link
                href={pageHref(token, filters, filters.page - 1)}
                className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-control border border-line bg-surface px-4 text-[13px] font-semibold text-ink transition-colors duration-200 hover:border-line-strong"
              >
                <ChevronLeft aria-hidden className="size-4" strokeWidth={2.5} />
                Previous
              </Link>
            ) : (
              <span className="inline-flex h-11 items-center gap-1.5 rounded-control border border-line/60 px-4 text-[13px] font-semibold text-line-strong">
                <ChevronLeft aria-hidden className="size-4" strokeWidth={2.5} />
                Previous
              </span>
            )}

            {hasNext ? (
              <Link
                href={pageHref(token, filters, filters.page + 1)}
                className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-control border border-line bg-surface px-4 text-[13px] font-semibold text-ink transition-colors duration-200 hover:border-line-strong"
              >
                Next
                <ChevronRight aria-hidden className="size-4" strokeWidth={2.5} />
              </Link>
            ) : (
              <span className="inline-flex h-11 items-center gap-1.5 rounded-control border border-line/60 px-4 text-[13px] font-semibold text-line-strong">
                Next
                <ChevronRight aria-hidden className="size-4" strokeWidth={2.5} />
              </span>
            )}
          </nav>
        ) : null}
      </main>
    </div>
  );
}
