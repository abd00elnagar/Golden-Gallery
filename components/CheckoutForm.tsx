"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Truck, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { createOrderAction } from "@/lib/actions";
import type { User } from "@/lib/types";

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
  color_name?: string;
}

interface CheckoutFormProps {
  user: User;
  cartItems: CartItem[];
}

export default function CheckoutForm({ user, cartItems }: CheckoutFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingData, setShippingData] = useState({
    firstName: user.name?.split(" ")[0] || "",
    lastName: user.name?.split(" ").slice(1).join(" ") || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal;

  const isBuyNow =
    cartItems.length === 1 &&
    !user.cart.some((item) => item.productId === cartItems[0].productId);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Validate phone number
    if (!shippingData.phone || shippingData.phone.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please provide a valid phone number for delivery.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    try {
      // Create FormData for the server action
      const formData = new FormData();
      formData.append("firstName", shippingData.firstName);
      formData.append("lastName", shippingData.lastName);
      formData.append("email", shippingData.email);
      formData.append("phone", shippingData.phone);
      formData.append("address", shippingData.address);
      formData.append("governorate", ""); // Empty for now
      formData.append("district", ""); // Empty for now
      formData.append("village", ""); // Empty for now
      if (isBuyNow) {
        formData.append("buyNow", "1");
        formData.append("cartItems", JSON.stringify(cartItems));
      }

      // Submit the form
      const result = await createOrderAction(
        { success: false, error: null },
        formData
      );

      if (result.success) {
        toast({
          title: "Order placed successfully!",
          description:
            "You will receive a confirmation email shortly. Pay cash on delivery.",
        });
        router.push(`/orders/${result.orderId}`);
      } else {
        toast({
          title: "Order failed",
          description:
            result.error || "An error occurred while placing your order.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Order failed",
        description: "An error occurred while placing your order.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        {isBuyNow && <input type="hidden" name="buyNow" value="1" />}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Cash on Delivery (COD)</strong> - Pay with cash when
                your order arrives. No payment information required.
              </AlertDescription>
            </Alert>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Please ensure your phone number
                    is correct. Orders with incorrect phone numbers will be
                    automatically cancelled.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Email Notice:</strong> Your order confirmation email
                    may be sent to your spam/junk folder. Please check there if
                    you don't receive it in your inbox.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={shippingData.firstName}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          firstName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={shippingData.lastName}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          lastName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingData.email}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={shippingData.phone}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          phone: e.target.value,
                        })
                      }
                      placeholder="+20 155 900 5729"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Input
                    id="address"
                    value={shippingData.address}
                    onChange={(e) =>
                      setShippingData({
                        ...shippingData,
                        address: e.target.value,
                      })
                    }
                    placeholder="123 Main Street, Apartment 4B"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-3 items-center"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground border">
                            No Image
                          </div>
                        )}
                        <span className="absolute top-1 right-1 bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                          {item.quantity}x
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {item.productName}
                        </h4>
                        {item.color_name && (
                          <p className="text-xs text-muted-foreground">
                            Color: {item.color_name}
                          </p>
                        )}
                        <p className="text-sm font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Place Order (COD)
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Pay cash when your order arrives
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
