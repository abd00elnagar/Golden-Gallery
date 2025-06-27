"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Search, ShoppingCart, Heart, User, Menu, Sun, Moon, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  console.log("Current theme:", theme)
  const [language, setLanguage] = useState("en")

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm ">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <img
            src={`/logo-${theme}.png`}
            alt="Golden Gallery Logo"
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="text-xl font-bold">Golden Gallery</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 ml-8">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/favorites" className="text-sm font-medium hover:text-primary transition-colors">
            Favorites
          </Link>
          <Link href="/orders" className="text-sm font-medium hover:text-primary transition-colors">
            Orders
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-primary focus:bg-background transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-4 w-4" />
                <span className="sr-only">Change language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("es")}>Español</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("fr")}>Français</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
            <Button variant="ghost" size="sm">
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
