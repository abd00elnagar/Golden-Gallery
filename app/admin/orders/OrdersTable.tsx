"use client";

import { useState } from "react";
import {
  Eye,
  Search,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { updateOrderStatus } from "@/lib/actions";

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
} as const;

const statusColors = {
  pending: "secondary",
  processing: "outline",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
} as const;

interface OrdersTableProps {
  initialOrders: Order[];
}

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  const { toast } = useToast();
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    const updated = await updateOrderStatus(orderId, newStatus);
    if (updated) {
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast({
        title: "Order status updated",
        description: `Order status has been changed to ${newStatus}.`,
      });
    } else {
      toast({
        title: "Error updating order",
        description: "There was a problem updating the order status.",
        variant: "destructive",
      });
    }
  };

  const getStatusOptions = (currentStatus: Order["status"]) => {
    const allStatuses: Order["status"][] = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    return allStatuses.filter((status) => status !== currentStatus);
  };

  return (
    <>
      {/* Filters */}
      <Card className="mb-6 w-full">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-primary focus:bg-background transition-colors"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const StatusIcon = statusIcons[order.status];
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <span className="font-medium">
                            {order.order_number}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            Customer #{order.user_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} items
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value: Order["status"]) =>
                            handleStatusUpdate(order.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <Badge
                              variant={statusColors[order.status]}
                              className="capitalize"
                            >
                              {order.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {getStatusOptions(order.status).map((status) => (
                              <SelectItem
                                key={status}
                                value={status}
                                className="capitalize"
                              >
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${order.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">
                                View order details
                              </span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Order {order.order_number}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              {/* Order Status */}
                              <div className="flex items-center gap-2">
                                <StatusIcon className="h-5 w-5" />
                                <Badge
                                  variant={statusColors[order.status]}
                                  className="capitalize"
                                >
                                  {order.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(
                                    order.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>

                              {/* Customer Information */}
                              <div>
                                <h3 className="font-semibold mb-3">
                                  Customer Information
                                </h3>
                                <div className="p-3 border rounded-lg space-y-1">
                                  <p className="text-sm">
                                    Customer ID: {order.user_id}
                                  </p>
                                  <p className="text-sm">
                                    Email: {order.userEmail}
                                  </p>
                                  <p className="text-sm">
                                    Phone: {order.shipping_phone}
                                  </p>
                                  <p className="text-sm">
                                    Payment: {order.payment_method}
                                  </p>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div>
                                <h3 className="font-semibold mb-3">
                                  Items ({order.items.length})
                                </h3>
                                <div className="space-y-3">
                                  {order.items.map((item) => (
                                    <div
                                      key={item.product_id}
                                      className="flex gap-3 p-3 border rounded-lg"
                                    >
                                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                        <Package className="h-6 w-6 text-muted-foreground" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-medium">
                                          {item.product_name}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                          Color: {item.color_name}
                                        </p>
                                        <p className="text-sm">
                                          Quantity: {item.quantity}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium">
                                          $
                                          {(item.price * item.quantity).toFixed(
                                            2
                                          )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          ${item.price} each
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Shipping Information */}
                              <div>
                                <h3 className="font-semibold mb-3">
                                  Shipping Information
                                </h3>
                                <div className="p-3 border rounded-lg space-y-1">
                                  <p className="text-sm">
                                    {order.shipping_address}
                                  </p>
                                  <p className="text-sm">
                                    {order.shipping_phone}
                                  </p>
                                </div>
                              </div>

                              {/* Order Total */}
                              <div>
                                <h3 className="font-semibold mb-3">
                                  Order Total
                                </h3>
                                <div className="p-3 border rounded-lg">
                                  <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>
                                      ${order.total_amount.toFixed(2)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Paid via {order.payment_method}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
