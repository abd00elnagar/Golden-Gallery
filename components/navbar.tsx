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
import { signIn, signOut } from "next-auth/react";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import Image from "next/image";
import type { User as UserType } from "@/lib/types";

interface NavbarProps {
  user: UserType | null;
}

export function Navbar({ user }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!theme) setTheme("light");
  }, [theme, setTheme]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-black">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Logo on the left */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-lg sm:text-xl font-bold text-foreground">
              Aldhabi Store
            </span>
          </Link>
        </div>

        {/* Actions on the right */}
        <div className="flex items-center space-x-1 sm:space-x-2 justify-end">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
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
              {user && user?.favorites?.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {user.favorites.length}
                </span>
              )}
              <span className="sr-only">Favorites</span>
            </Link>
          </Button>

          {/* Notification Dropdown */}
          {user && <NotificationDropdown user={user} />}

          {/* User Menu or Sign in Button */}
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
              className="inline-flex items-center font-medium text-base px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              Sign in
            </Button>
          )}

          {/* Mobile Menu */}
          {user && (
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
          )}
        </div>
      </div>
    </header>
  );
}
