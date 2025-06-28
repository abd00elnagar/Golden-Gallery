"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { ShoppingCart, Heart, User, Menu, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface NavbarProps {
  cartCount?: number
  favoritesCount?: number
  user?: { name: string; image?: string } | null
}

export function Navbar({ cartCount = 0, favoritesCount = 0, user }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!theme) setTheme("light")
  }, [theme, setTheme])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Logo on the left */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <img
              src={`/logo-${mounted ? (theme || "light") : "light"}.png`}
              alt="Golden Gallery Logo"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-lg sm:text-xl font-bold">Golden Gallery</span>
          </Link>
        </div>

        {/* Actions on the right */}
        <div className="flex items-center space-x-1 sm:space-x-2 justify-end">
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Favorites */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/favorites">
              <Heart className="h-5 w-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center min-w-[20px] shadow-lg border-2 border-background">
                  {favoritesCount > 99 ? "99+" : favoritesCount}
                </span>
              )}
              <span className="sr-only">Favorites ({favoritesCount})</span>
            </Link>
          </Button>

          {/* Cart */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center min-w-[20px] shadow-lg border-2 border-background animate-pulse">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
              <span className="sr-only">Cart ({cartCount})</span>
            </Link>
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard">Admin Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Sign in
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4">
                <Link href="/" className="text-sm font-medium">
                  Home
                </Link>
                <Link href="/favorites" className="text-sm font-medium">
                  Favorites
                </Link>
                <Link href="/orders" className="text-sm font-medium">
                  Orders
                </Link>
                <Link href="/profile" className="text-sm font-medium">
                  Profile
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
