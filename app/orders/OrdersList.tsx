"use client";
import Link from "next/link";
import {
  Eye,
  Download,
  Mail,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Order } from "@/lib/types";
import { useActionState } from "react";
import { resendOrderEmailAction } from "./actions";
import { useToast } from "@/hooks/use-toast";

const statusIcons = {
  pending: Package,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusColors = {
  pending: "secondary",
  processing: "outline",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
} as const;

export default function OrdersList({ orders }: { orders: Order[] }) {
  const { toast } = useToast();

  // Action state for each order (by orderId)
  const [resendState, resendAction] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await resendOrderEmailAction(formData);
      if (result.success) {
        toast({ title: "Success", description: "Confirmation email resent." });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to resend email.",
          variant: "destructive",
        });
      }
      return result;
    },
    null
  );

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              When you place your first order, it will appear here.
            </p>
            <Button asChild>
              <Link href="/">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.status];
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <StatusIcon className="h-5 w-5" />
                        Order {order.order_number}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Placed on{" "}
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={statusColors[order.status]}
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                      <span className="text-lg font-bold">
                        EGP {order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Items:</span>{" "}
                        {order.items.length}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Payment:</span>{" "}
                        {order.payment_method}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Shipping:</span>{" "}
                        {order.shipping_address}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                      <form action={resendAction}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <Button variant="outline" size="sm" type="submit">
                          <Mail className="h-4 w-4 mr-2" />
                          Resend Email
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
