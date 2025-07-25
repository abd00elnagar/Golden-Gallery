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
  const [error, setError] = useState<string | null>(null);

  const [shippingData, setShippingData] = useState({
    firstName: user.name?.split(" ")[0] || "",
    lastName: user.name?.split(" ").slice(1).join(" ") || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
  });

  const [paymentMethod, setPaymentMethod] = useState<string>("cod");

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
    setError(null);

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
      formData.append("payment_method", paymentMethod);
      if (isBuyNow) {
        formData.append("buyNow", "1");
        formData.append("cartItems", JSON.stringify(cartItems));
      }

      console.log("Debug - Payment method:", {
        paymentMethod,
        formDataPaymentMethod: formData.get("payment_method"),
        shippingData,
      });

      // Submit the form
      const result = await createOrderAction(
        { success: false, error: null },
        formData
      );

      if (result.success) {
        toast({
          title: "Order placed successfully!",
          description: result.message,
        });
        router.push(`/orders/${result.orderId}`);
      } else {
        const errorDetails = result.details
          ? `\n\nDetails: ${result.details}`
          : "";
        console.error("Order creation failed:", {
          error: result.error,
          details: result.details,
        });
        setError(`${result.error}${errorDetails}`);
        toast({
          title: "Order failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while placing your order.";
      setError(errorMessage);
      toast({
        title: "Order failed",
        description: errorMessage,
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

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold">Error creating order:</div>
            <div className="mt-1">{error}</div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {isBuyNow && <input type="hidden" name="buyNow" value="1" />}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Notice */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Payment Method</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cod">
                          Cash on Delivery (COD)
                        </SelectItem>
                        <SelectItem value="instapay">Instapay</SelectItem>
                        <SelectItem value="vodafone_cash">
                          Vodafone Cash
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMethod === "cod" && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Cash on Delivery (COD)</strong> - Pay with cash
                        when your order arrives. No payment information
                        required.
                      </AlertDescription>
                    </Alert>
                  )}

                  {paymentMethod === "instapay" && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Instapay</strong> - Send payment to Instapay
                        number:
                        <strong className="block mt-1">01066425852</strong>
                        Please include your order number in the payment
                        reference.
                      </AlertDescription>
                    </Alert>
                  )}

                  {paymentMethod === "vodafone_cash" && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Vodafone Cash</strong> - Send payment to
                        Vodafone Cash wallet:
                        <strong className="block mt-1">01066425852</strong>
                        Please include your order number in the payment
                        reference.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

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
                        EGP {(item.price * item.quantity).toFixed(2)}
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
                    <span>EGP{subtotal.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>EGP{total.toFixed(2)}</span>
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
                      Place Order
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {paymentMethod === "cod"
                    ? "Pay cash when your order arrives"
                    : "Please send the payment and include your order number as reference"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
