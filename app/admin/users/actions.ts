"use server";

import { redirect } from "next/navigation";

export async function exportUsersAction() {
  redirect("/api/users/export");
}
