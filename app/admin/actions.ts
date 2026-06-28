"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { login, logout, requireAuth } from "@/lib/auth";
import * as repo from "@/lib/repository";

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const ok = await login(password);
  if (!ok) redirect("/admin/login?error=1");
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/");
}

export async function saveDispatch(formData: FormData) {
  await requireAuth();
  const idRaw = formData.get("id");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const author = String(formData.get("author") ?? "").trim();
  const priority: repo.Priority =
    formData.get("priority") === "high" ? "high" : "normal";
  const intent = String(formData.get("intent") ?? "draft");
  const status: repo.Status = intent === "publish" ? "published" : "draft";

  if (!title) {
    redirect(idRaw ? `/admin/${idRaw}/edit?error=title` : "/admin/new?error=title");
  }

  if (idRaw) {
    repo.updateItem(Number(idRaw), title, body, author, priority, status);
  } else {
    repo.createItem(title, body, author, priority, status);
  }
  refresh();
  redirect("/admin");
}

export async function publishAction(id: number) {
  await requireAuth();
  repo.setStatus(id, "published");
  refresh();
}

export async function unpublishAction(id: number) {
  await requireAuth();
  repo.setStatus(id, "draft");
  refresh();
}

export async function deleteAction(id: number) {
  await requireAuth();
  repo.deleteItem(id);
  refresh();
}
