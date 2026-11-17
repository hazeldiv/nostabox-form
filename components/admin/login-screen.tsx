import Image from "next/image";

import { LoginForm } from "@/components/admin/login-form";
import logo from "@/public/logo.png";

export function LoginScreen() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center text-center">
          <Image
            src={logo}
            alt="Nostabox"
            priority
            sizes="96px"
            className="h-[92px] w-[92px] object-contain mix-blend-multiply"
          />
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
            Order Panel
          </p>
          <h1 className="mt-3 text-[26px] leading-tight">Sign in to view orders</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            This page is for Nostabox admins only.
          </p>
        </div>

        <div className="mt-7 rounded-card border border-line bg-surface p-5 sm:p-6">
          <LoginForm />
        </div>

        <p className="mt-5 text-center text-[12px] leading-relaxed text-muted">
          Forgot the password? Contact the form owner to reset it.
        </p>
      </div>
    </main>
  );
}
