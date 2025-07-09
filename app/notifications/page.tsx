import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import NotificationsClient from "./notifications-client";

export const generateMetadata = async () => {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://aldahbi.com";
  return {
    title: "Notifications",
    description: "View your notifications at Aldahbi Store.",
    alternates: { canonical: `${domain}/notifications` },
    openGraph: {
      title: "Notifications",
      description: "View your notifications at Aldahbi Store.",
      url: `${domain}/notifications`,
      images: ["/logo-light.png"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Notifications",
      description: "View your notifications at Aldahbi Store.",
      images: ["/logo-light.png"],
    },
  };
};

export default async function NotificationsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return <NotificationsClient user={user} />;
}
