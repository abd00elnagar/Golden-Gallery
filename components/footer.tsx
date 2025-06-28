"use client"
import Link from "next/link"

import { useEffect, useState } from "react";

export function Footer() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    setMounted(true);
    // Example: get theme from localStorage or system preference
    const storedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    } else {
      // fallback to system preference
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img
              src={`/logo-${mounted ? (theme || "light") : "light"}.png`}
              alt="Golden Gallery Logo"
              className="h-8 w-8 rounded-full object-cover"
            />
              <span className="text-xl font-bold">Golden Gallery</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Discover and collect beautiful artwork from talented artists around the world.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/?category=paintings" className="text-muted-foreground hover:text-primary">
                  Paintings
                </Link>
              </li>
              <li>
                <Link href="/?category=sculptures" className="text-muted-foreground hover:text-primary">
                  Sculptures
                </Link>
              </li>
              <li>
                <Link href="/?category=photography" className="text-muted-foreground hover:text-primary">
                  Photography
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-primary">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-muted-foreground hover:text-primary">
                  Orders
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-muted-foreground hover:text-primary">
                  Favorites
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-muted-foreground hover:text-primary">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Golden Gallery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
