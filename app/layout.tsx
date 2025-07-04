import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { NavbarWrapper } from "@/components/navbar-wrapper";
import { Footer } from "@/components/footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Aldahbi Store",
    template: "%s | Aldahbi Store",
  },
  description: "Your one-stop shop for premium home supplies and essentials.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://aldahbi.com"
  ),
  openGraph: {
    title: "Aldahbi Store",
    description: "Your one-stop shop for premium home supplies and essentials.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://aldahbi.com",
    siteName: "Aldahbi Store",
    images: [
      {
        url: "/logo-light.png",
        width: 512,
        height: 512,
        alt: "Aldahbi Store Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aldahbi Store",
    description: "Your one-stop shop for premium home supplies and essentials.",
    images: ["/logo-light.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://aldahbi.com",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFD700",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FFD700" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="canonical"
          href={process.env.NEXT_PUBLIC_APP_URL || "https://aldahbi.com"}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavbarWrapper />
          <main className="min-h-screen">{children}</main>
          <SpeedInsights />
          <Analytics />
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
