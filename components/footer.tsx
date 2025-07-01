"use client"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Image from "next/image"

export function Footer() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <footer className="border-t bg-muted/30 ">
      <div className="container py-6 sm:py-8 px-3 sm:px-6 lg:px-8 flex flex-col items-center max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 w-full place-items-center">
          <div className="flex flex-col items-center col-span-2 sm:col-span-4 md:col-span-1 mb-4 sm:mb-0">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <Image
                src={`/logo-${mounted ? (theme || "light") : "light"}.png`}
                alt="Golden Gallery Logo"
                className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover"
                width={32}
                height={32}
              />
              <span className="text-lg sm:text-xl font-bold">Aldahbi store</span>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm text-center max-w-[250px] sm:max-w-none">
              Discover and collect beautiful artwork from talented artists around the world.
            </p>
          </div>

          <div className="flex flex-col items-start">
            <h3 className="font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Shop</h3>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
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

          <div className="flex flex-col items-start">
            <h3 className="font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Account</h3>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
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

          <div className="flex flex-col items-start">
            <h3 className="font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Support</h3>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
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

        <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground w-full">
          <p>&copy; 2025 Golden Gallery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
