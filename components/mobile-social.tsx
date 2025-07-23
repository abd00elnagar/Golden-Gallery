"use client";

import Link from "next/link";
import { Facebook, Instagram, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export function MobileSocial() {
  return (
    <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 bg-background border-t">
      <div className="flex items-center justify-center gap-4 h-12">
        <Link
          href="https://www.facebook.com/share/1Cju2cXhqL/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <Facebook className="h-5 w-5" />
          <span className="text-xs">FB</span>
        </Link>
        <Link
          href="https://www.instagram.com/al_dahabi_store?igsh=MmM0dm0yY3pweHgw"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <Instagram className="h-5 w-5" />
          <span className="text-xs">IG</span>
        </Link>
        <Link
          href="https://maps.google.com/?q=30.2198754,31.4750288"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <MapPin className="h-5 w-5" />
          <span className="text-xs">Map</span>
        </Link>
        <Link
          href="https://wa.me/201559005729"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <FaWhatsapp className="h-5 w-5" />
          <span className="text-xs">WA</span>
        </Link>
      </div>
    </div>
  );
}
