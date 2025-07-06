"use client";

import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";

export function MobileSocial() {
  return (
    <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 bg-background border-t">
      <div className="flex items-center justify-center gap-6 h-12">
        <Link
          href="https://www.facebook.com/share/1Cju2cXhqL/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          <Facebook className="h-5 w-5" />
          <span className="text-xs">Facebook</span>
        </Link>
        <Link
          href="https://www.instagram.com/al_dahabi_store?igsh=MmM0dm0yY3pweHgw"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          <Instagram className="h-5 w-5" />
          <span className="text-xs">Instagram</span>
        </Link>
      </div>
    </div>
  );
}
