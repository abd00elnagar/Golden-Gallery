import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { mockUser } from "@/lib/mock-data"
import { getServerSession } from "next-auth"
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
  console.log(session)
  const user = session ? { name: session.user?.name, image: session.user?.image } : null

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            <Navbar cartCount={mockUser.cart.length} favoritesCount={mockUser.favorites.length} user={user} />
            <main className="flex-1 px-4 sm:px-6 lg:px-8">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
