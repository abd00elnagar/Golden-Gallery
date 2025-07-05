"use client";

import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function SignInPage() {
  const [providers, setProviders] = useState<any>(null);
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    setAuthProviders();
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

  if (!mounted || !providers) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
            </div>
            <div className="h-6 w-32 bg-gray-200 rounded mx-auto mb-2" />
            <div className="h-4 w-24 bg-gray-200 rounded mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Image
              src={logoSrc}
              alt="Aldahbi Store Logo"
              width={48}
              height={48}
              className="rounded-full"
              priority
            />
          </div>
          <CardTitle className="text-2xl">Welcome to Aldahbi Store</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.values(providers).map((provider: any) => (
            <Button
              key={provider.name}
              onClick={() => signIn(provider.id, { callbackUrl: "/profile" })}
              className="w-full"
              size="lg"
            >
              Sign in with {provider.name}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
