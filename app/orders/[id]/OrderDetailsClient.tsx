"use client";
import Link from "next/link";
import { CheckCircle, Download, Mail, Package, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useActionState } from "react";
import { resendOrderEmailAction } from "../actions";
import { useToast } from "@/hooks/use-toast";

export default function OrderDetailsClient({ order }: { order: any }) {
  const { toast } = useToast();
  const [resendState, resendAction] = useActionState(async (prev, formData) => {
    const result = await resendOrderEmailAction(formData);
    if (result.success) {
      toast({
        title: "Email Sent",
        description: "Order confirmation email has been resent successfully.",
      });
    } else {
      toast({
        title: "Email Failed",
        description:
          result.error ||
          "Failed to resend email. Please check your email configuration.",
        variant: "destructive",
      });
    }
    return result;
  }, null);

  // Calculate totals
  const subtotal = order.items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  const total = order.total_amount;
  const estimatedDelivery = new Date(
    Date.now() + 3 * 24 * 60 * 60 * 1000
  ).toLocaleDateString();
  const orderDate = new Date(order.created_at);
  const now = new Date();
  const isRecent =
    now.getTime() - orderDate.getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          {isRecent ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground">
                Thank you for your purchase. Your order has been successfully
                placed.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Package className="h-8 w-8 text-gray-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Order Details</h1>
              <p className="text-muted-foreground">
                This order was placed on {orderDate.toLocaleDateString()}.
              </p>
            </>
          )}
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-medium">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Estimated Delivery
                </p>
                <p className="font-medium">{estimatedDelivery}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="secondary" className="capitalize">
                  {order.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Items Ordered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.product_name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product_name}</h4>
                    {item.color_name && (
                      <p className="text-sm text-muted-foreground">
                        Color: {item.color_name}
                      </p>
                    )}
                    <p className="text-sm">Quantity: {item.quantity}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-6 w-6 p-0 hover:bg-muted mt-1"
                    >
                      <Link href={`/product/${item.product_id}`}>
                        <Eye className="h-3 w-3" />
                        <span className="sr-only">View product details</span>
                      </Link>
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                    EGP {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    EGP {item.price} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>EGP {subtotal.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>EGP {total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{order.shipping_address}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Phone: {order.shipping_phone}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm capitalize">{order.payment_method}</p>
              {order.payment_method === "cod" && (
                <p className="text-sm text-muted-foreground mt-1">
                  Pay cash on delivery
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <form action={resendAction}>
            <input type="hidden" name="orderId" value={order.id} />
            <Button variant="outline" type="submit">
              <Mail className="h-4 w-4 mr-2" />
              Resend Email
            </Button>
          </form>
          <Button asChild>
            <Link href="/orders">View All Orders</Link>
          </Button>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-muted-foreground">
                    We're preparing your items for shipment.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Shipping</p>
                  <p className="text-muted-foreground">
                    You'll receive a tracking number once your order ships.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Delivery</p>
                  <p className="text-muted-foreground">
                    Your order will arrive by {estimatedDelivery}.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
