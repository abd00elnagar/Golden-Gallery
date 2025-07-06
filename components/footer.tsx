"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("border-t bg-muted/30", className)}>
      <div className="container py-6 sm:py-8 px-3 sm:px-6 lg:px-8 flex flex-col items-center max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 w-full place-items-center">
          <div className="flex flex-col items-center col-span-2 sm:col-span-4 md:col-span-1 mb-4 sm:mb-0">
            <div className="flex items-center mb-3 sm:mb-4">
              <span className="text-lg sm:text-xl font-bold text-foreground">
                Aldahbi Store
              </span>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm text-center max-w-[250px] sm:max-w-none">
              Discover quality home supplies and essentials for every room in
              your house.
            </p>
          </div>

          <div className="flex flex-col items-start">
            <h3 className="font-semibold mb-2 sm:mb-4 text-sm sm:text-base">
              Shop
            </h3>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/?category=furniture"
                  className="text-muted-foreground hover:text-primary"
                >
                  Furniture
                </Link>
              </li>
              <li>
                <Link
                  href="/?category=kitchenware"
                  className="text-muted-foreground hover:text-primary"
                >
                  Kitchenware
                </Link>
              </li>
              <li>
                <Link
                  href="/?category=decor"
                  className="text-muted-foreground hover:text-primary"
                >
                  Home Decor
                </Link>
              </li>
              <li>
                <Link
                  href="/?category=appliances"
                  className="text-muted-foreground hover:text-primary"
                >
                  Appliances
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-start">
            <h3 className="font-semibold mb-2 sm:mb-4 text-sm sm:text-base">
              Account
            </h3>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/profile"
                  className="text-muted-foreground hover:text-primary"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-muted-foreground hover:text-primary"
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  className="text-muted-foreground hover:text-primary"
                >
                  Favorites
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-muted-foreground hover:text-primary"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-start">
            <h3 className="font-semibold mb-2 sm:mb-4 text-sm sm:text-base">
              Support
            </h3>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground w-full">
          <p>&copy; 2025 Aldahbi Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
