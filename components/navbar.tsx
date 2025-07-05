"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ShoppingCart, Heart, User, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "next-auth/react";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import Image from "next/image";
import type { User as UserType } from "@/lib/types";

interface NavbarProps {
  user: UserType | null;
}

export function Navbar({ user }: NavbarProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle initial mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the current theme
  const currentTheme = mounted
    ? theme === "system"
      ? systemTheme
      : theme
    : "light";

  // Determine logo source
  const logoSrc = `/logo-${currentTheme || "light"}.png`;

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <span className="text-lg sm:text-xl font-bold">
                Aldahbi Store
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 justify-end">
            <div className="w-8 h-8" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Logo on the left */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={logoSrc}
              alt="Aldahbi Store Logo"
              width={32}
              height={32}
              className="rounded-full"
              priority
            />
            <span className="text-lg sm:text-xl font-bold">Aldahbi Store</span>
          </Link>
        </div>

        {/* Actions on the right */}
        <div className="flex items-center space-x-1 sm:space-x-2 justify-end">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Cart - Desktop Only */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex relative"
            asChild
          >
            <Link href="/cart">
              <ShoppingCart className="h-4 w-4" />
              {user?.cart?.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {user.cart.length}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>

          {/* Favorites - Desktop Only */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex relative"
            asChild
          >
            <Link href="/favorites">
              <Heart className="h-4 w-4" />
              {user?.favorites?.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {user.favorites.length}
                </span>
              )}
              <span className="sr-only">Favorites</span>
            </Link>
          </Button>

          {/* Notification Dropdown */}
          {user && <NotificationDropdown user={user} />}

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <h3>{user.name}</h3>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user.role === "admin" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              asChild
            >
              <Link href="/auth/signin">Sign in</Link>
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
                <Link
                  href="/profile"
                  className="flex items-center gap-3 text-sm font-medium"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center gap-3 text-sm font-medium"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Orders
                </Link>
                <Link
                  href="/favorites"
                  className="flex items-center gap-3 text-sm font-medium"
                >
                  <Heart className="h-4 w-4" />
                  Favorites
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center gap-3 text-sm font-medium"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 text-sm font-medium"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Dashboard
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
