export const dynamic = "force-static";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
        Please check the URL or return to the homepage.
      </p>
      <Button asChild size="lg">
        <Link href="/">Go to Homepage</Link>
      </Button>
    </div>
  );
}
