import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import NotificationsClient from "./notifications-client";

export default async function NotificationsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return <NotificationsClient user={user} />;
}
