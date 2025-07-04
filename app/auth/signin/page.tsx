import SignInPage from "@/components/SigninPage"
import { getUser } from "@/lib/auth"
import { User } from "@/lib/types"
import { redirect } from "next/navigation"

export const generateMetadata = async () => {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://aldahbi.com";
  return {
    title: "Sign In",
    description: "Sign in to your Aldahbi Store account.",
    alternates: { canonical: `${domain}/auth/signin` },
    openGraph: {
      title: "Sign In",
      description: "Sign in to your Aldahbi Store account.",
      url: `${domain}/auth/signin`,
      images: ["/logo-light.png"],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: "Sign In",
      description: "Sign in to your Aldahbi Store account.",
      images: ["/logo-light.png"]
    }
  }
}

export default async function AuthSignInPage() {
  const user: User | null = await getUser()
  if (user) {
    return redirect("/profile")
  }
  return <SignInPage />
}