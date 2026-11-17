"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  clearLoginAttempts,
  clearSession,
  hasSession,
  isLoginRateLimited,
  panelPath,
  setSession,
  verifyPassword,
} from "@/lib/admin";

export type LoginState = { error: string | null };

async function resolveClientKey(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");

  if (forwarded) return forwarded.split(",")[0]!.trim();

  return headerList.get("x-real-ip") ?? "local";
}

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const key = await resolveClientKey();

  if (isLoginRateLimited(key)) {
    return { error: "Too many attempts. Try again in 15 minutes." };
  }

  if (!password || !verifyPassword(password)) {
    return { error: "Incorrect password." };
  }

  clearLoginAttempts(key);
  await setSession();
  revalidatePath(`/admin/${panelPath()}`);

  return { error: null };
}

export async function logout(): Promise<void> {
  await clearSession();
  revalidatePath(`/admin/${panelPath()}`);
}

export async function requireSession(): Promise<void> {
  if (!(await hasSession())) {
    throw new Error("Admin session expired. Please sign in again.");
  }
}
