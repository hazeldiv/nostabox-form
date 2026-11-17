import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { AdminPanel } from "@/components/admin/admin-panel";
import { LoginScreen } from "@/components/admin/login-screen";
import { hasSession, isPanelPath } from "@/lib/admin";
import { parseFilters } from "@/lib/orders";
import { getStats, listOrders } from "@/lib/orders-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders — Nostabox",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ params, searchParams }: PageProps) {
  const { token } = await params;

  if (!isPanelPath(token)) notFound();

  if (!(await hasSession())) {
    return <LoginScreen />;
  }

  const filters = parseFilters(await searchParams);

  try {
    const [stats, list] = await Promise.all([getStats(), listOrders(filters)]);

    return <AdminPanel token={token} filters={filters} stats={stats} list={list} />;
  } catch (error) {
    console.error("[admin-page]", error);

    return (
      <main className="flex min-h-dvh items-center justify-center px-5">
        <div className="w-full max-w-[440px] rounded-card border border-line bg-surface p-6">
          <h1 className="text-[20px]">Could not load orders</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Check the Supabase connection and make sure the database schema has been applied.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-control border border-line bg-bg px-3 py-2 text-[11px] leading-relaxed text-ink-soft">
            {error instanceof Error ? error.message : "Unknown error"}
          </pre>
        </div>
      </main>
    );
  }
}
