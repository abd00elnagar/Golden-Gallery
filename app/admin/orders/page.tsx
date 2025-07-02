import { Suspense } from "react";
import { getOrders } from "@/lib/actions";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrdersTable } from "./OrdersTable";
import Loading from "./loading";
import type { Order } from "@/lib/types";

// Add a type for enriched order
interface OrderWithUserEmail extends Order {
  userEmail: string;
}

// Helper to enrich orders with user email
async function enrichOrdersWithUserEmail(orders: Order[]): Promise<OrderWithUserEmail[]> {
  const { getUserById } = await import("@/lib/actions");
  return Promise.all(
    orders.map(async (order) => {
      const user = order.user_id ? await getUserById(order.user_id) : null;
      return {
        ...order,
        userEmail: user?.email || "",
      };
    })
  );
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  const ordersWithUsers = await enrichOrdersWithUserEmail(orders);
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
          <OrdersTable initialOrders={ordersWithUsers} />
        </Suspense>
      </div>
    </div>
  );
}
