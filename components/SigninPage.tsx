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

export default function SignInPage() {
  const [providers, setProviders] = useState<any>(null);

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    setAuthProviders();
  }, []);

  if (!providers) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Aldhabi Store</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.values(providers).map((provider: any) => (
            <Button
              key={provider.name}
              onClick={() => signIn(provider.id, { callbackUrl: "/profile" })}
              className={`w-full flex items-center justify-center gap-2 font-medium text-black border border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:text-black transition-colors ${
                provider.id === "google" ? "py-3" : ""
              }`}
              size="lg"
              variant={provider.id === "google" ? "outline" : "default"}
            >
              {provider.id === "google" && (
                <img
                  src="/google-icon.svg"
                  alt="Google"
                  width={22}
                  height={22}
                  className="mr-1"
                />
              )}
              <span>Sign in with {provider.name}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
