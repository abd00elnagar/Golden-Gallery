import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
        <div className="text-center sm:text-left">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Search Skeleton */}
      <Card className="mb-6 w-full">
        <CardContent className="p-4">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card className="w-full">
        <CardHeader className="text-center sm:text-left">
          <CardTitle>
            <Skeleton className="h-6 w-32 mx-auto sm:mx-0" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4 border rounded-lg">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-5 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
