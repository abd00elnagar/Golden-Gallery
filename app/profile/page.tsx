import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./ProfileForm";
import { getUser } from "@/lib/auth";
import { redirect } from "next/dist/server/api-utils";
import SignInPage from "@/components/SigninPage";

export const generateMetadata = async () => {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://aldahbi.com";
  return {
    title: "My Profile",
    description: "Manage your account information at Aldhabi Store.",
    alternates: { canonical: `${domain}/profile` },
    openGraph: {
      title: "My Profile",
      description: "Manage your account information at Aldhabi Store.",
      url: `${domain}/profile`,
      images: ["/logo-light.png"],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: "My Profile",
      description: "Manage your account information at Aldhabi Store.",
      images: ["/logo-light.png"],
    },
  };
};

export default async function ProfilePage() {
  const user = await getUser();
  return user ? (
    <div className="min-h-screen flex justify-center items-start py-8">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your account information
            </p>
          </div>
        </div>
        <ProfileForm user={user} />
      </div>
    </div>
  ) : (
    <SignInPage />
  );
}
