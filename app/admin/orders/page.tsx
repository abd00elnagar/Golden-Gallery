import { Suspense } from "react";
import { getOrders } from "@/lib/actions";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrdersTable } from "./OrdersTable";
import Loading from "./loading";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Button variant="ghost" asChild>
            <Link href="/admin" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Orders Management</h1>
            <p className="text-muted-foreground">
              Track and manage customer orders
            </p>
          </div>
        </div>

        <Suspense fallback={<Loading />}>
          <OrdersTable initialOrders={orders} />
        </Suspense>
      </div>
    </div>
  );
}
