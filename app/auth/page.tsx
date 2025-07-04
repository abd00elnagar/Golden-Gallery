import SignInPage from "@/components/SigninPage"
import { getUser } from "@/lib/auth"
import { User } from "@/lib/types"
import { redirect } from "next/navigation"

export default async function AuthSignInPage() {
  const user: User | null = await getUser()
  if (user) {
    return redirect("/profile")
  }
  return <SignInPage />
}