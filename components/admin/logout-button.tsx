"use client";

import { useTransition } from "react";

import { LogOut } from "lucide-react";

import { logout } from "@/app/actions/admin-auth";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(async () => logout())}
      disabled={isPending}
      className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-control border border-line px-3 text-[12px] font-semibold text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-ink disabled:cursor-wait disabled:opacity-60"
    >
      <LogOut aria-hidden className="size-3.5" strokeWidth={2.5} />
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
