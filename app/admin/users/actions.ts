"use server";

import { getAllUsers } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function exportUsersAction() {
  redirect("/api/users/export");
}
