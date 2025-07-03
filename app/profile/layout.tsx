import { getServerSession } from "next-auth";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession();
  if (!session?.user) {
    return {
      title: "Profile - Sign In Required",
      description: "Please sign in to view your profile",
    };
  }

  return {
    title: `${session.user.name}'s Profile - Aldahbi Store`,
    description: `View and manage ${session.user.name}'s profile, orders, and preferences`,
  };
}

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
