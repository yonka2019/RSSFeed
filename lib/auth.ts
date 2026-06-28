import crypto from "crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { config } from "./config";

const COOKIE = "wire_session";

function sessionToken(): string {
  return crypto
    .createHmac("sha256", config.secret)
    .update("admin:v1")
    .digest("hex");
}

function sha256(value: string): Buffer {
  return crypto.createHash("sha256").update(value).digest();
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE)?.value === sessionToken();
}

export async function login(password: string): Promise<boolean> {
  const ok = crypto.timingSafeEqual(sha256(password), sha256(config.adminPassword));
  if (ok) {
    const store = await cookies();
    store.set(COOKIE, sessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return ok;
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function requireAuth(): Promise<void> {
  if (!(await isAuthed())) redirect("/admin/login");
}
