"use server";

import { getUser, updateUserProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(prevState: any, formData: FormData) {
  const userId = (await getUser())?.id;
  if (!userId) return { error: "User ID is required" };

  const updates = {
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
  };

  const result = await updateUserProfile(userId, updates);
  revalidatePath("/profile");
  if (!result) {
    return { error: "Failed to update profile" };
  }
  return { success: true };
}
