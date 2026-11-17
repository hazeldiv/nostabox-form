import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

export const ADMIN_COOKIE = "nostabox_admin";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;

const attempts = new Map<string, number[]>();

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;

  if (!value) throw new Error("ADMIN_SESSION_SECRET belum diset.");

  return value;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }

  return timingSafeEqual(left, right);
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function panelPath(): string {
  const value = process.env.ADMIN_PANEL_PATH;

  if (!value) throw new Error("ADMIN_PANEL_PATH belum diset.");

  return value;
}

export function isPanelPath(token: string): boolean {
  return safeEqual(token, panelPath());
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) throw new Error("ADMIN_PASSWORD belum diset.");

  return safeEqual(input, expected);
}

export function createSessionToken(now = Date.now()): string {
  const expires = String(now + SESSION_TTL_MS);

  return `${expires}.${sign(expires)}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;

  const [expires, signature] = token.split(".");

  if (!expires || !signature) return false;
  if (!safeEqual(signature, sign(expires))) return false;

  return Number(expires) > now;
}

export async function hasSession(): Promise<boolean> {
  const store = await cookies();

  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

export async function setSession(): Promise<void> {
  const store = await cookies();

  store.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();

  store.delete(ADMIN_COOKIE);
}

export function isLoginRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < LOGIN_WINDOW_MS);

  if (recent.length >= LOGIN_MAX_ATTEMPTS) {
    attempts.set(key, recent);
    return true;
  }

  recent.push(now);
  attempts.set(key, recent);

  return false;
}

export function clearLoginAttempts(key: string): void {
  attempts.delete(key);
}
