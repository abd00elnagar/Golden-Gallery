import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { getServerSession } from "next-auth"
import { getUser } from "@/lib/auth"
import { getUserCartCount, getUserFavoritesCount } from "@/lib/actions"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Golden Gallery - Discover Beautiful Artwork",
  description: "Discover and collect beautiful artwork from talented artists around the world.",
  generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const session = await getServerSession()
  let user: { name: string; image?: string; isAdmin: boolean } | null = null
  let cartCount = 0
  let favoritesCount = 0
  
  if (session?.user){
    const userData = await getUser()
    if (userData) {
      user = {
        name: session.user.name || userData.name,
        image: session.user.image || undefined,
        isAdmin: userData.role === "admin"
      }
      cartCount = await getUserCartCount(userData.id)
      favoritesCount = await getUserFavoritesCount(userData.id)
    }
  }
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            <Navbar cartCount={cartCount} favoritesCount={favoritesCount} user={user} />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
