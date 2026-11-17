"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { AlertCircle, ArrowRight, Lock } from "lucide-react";

import { login, type LoginState } from "@/app/actions/admin-auth";
import { controlClass } from "@/components/field";
import { cn } from "@/lib/cn";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [submitted, setSubmitted] = useState(false);
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!submitted) return;

    if (state.error === null) {
      router.refresh();
      return;
    }

    setShowError(true);
    setSubmitted(false);
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [submitted, state.error, router]);

  return (
    <form
      action={formAction}
      onSubmit={() => {
        setShowError(false);
        setSubmitted(true);
      }}
      className="w-full"
    >
      <div>
        <label htmlFor="password" className="text-[14px] font-semibold text-ink">
          Password
        </label>
        <div className="relative mt-2">
          <Lock
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
            strokeWidth={2.5}
          />
          <input
            ref={inputRef}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={showError ? true : undefined}
            aria-describedby={showError ? "password-error" : undefined}
            className={cn(controlClass(showError), "h-12 pl-10")}
            placeholder="Enter password"
          />
        </div>
      </div>

      {showError && state.error ? (
        <p
          id="password-error"
          role="alert"
          className="mt-2.5 flex items-start gap-1.5 text-[13px] font-semibold text-danger"
        >
          <AlertCircle aria-hidden className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.5} />
          <span>{state.error}</span>
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending || password.length === 0}
        className="mt-5 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-control bg-ink px-5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Checking..." : "Sign in"}
        {isPending ? null : <ArrowRight aria-hidden className="size-4" strokeWidth={2.5} />}
      </button>
    </form>
  );
}
