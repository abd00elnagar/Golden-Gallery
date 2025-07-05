export const dynamic = "force-static";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="mb-8 flex flex-col items-center">
        <Skeleton className="h-10 w-full max-w-lg mb-4" />
        <Skeleton className="h-6 w-full max-w-2xl" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
        <Skeleton className="h-10 w-full md:max-w-xl" />
        <Skeleton className="h-10 w-full md:w-48" />
      </div>

      {/* Results count skeleton */}
      <div className="flex justify-center mb-6">
        <Skeleton className="h-6 w-48" />
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <CardHeader className="p-4">
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
