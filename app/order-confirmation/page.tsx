"use client"

import Link from "next/link"
import { CheckCircle, Download, Mail, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { mockUser } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

export default function OrderConfirmationPage() {
  const { toast } = useToast()

  // Mock order data
  const orderData = {
    orderNumber: "ORD-2024-001234",
    date: new Date().toLocaleDateString(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    items: mockUser.cart,
    subtotal: mockUser.cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    shipping: 0,
    tax: mockUser.cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.08,
    total: mockUser.cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.08,
    shippingAddress: "123 Main Street, New York, NY 10001",
    paymentMethod: "•••• •••• •••• 1234",
  }

  const handleDownloadReceipt = () => {
    toast({
      title: "Download started",
      description: "Your receipt is being downloaded.",
    })
  }

  const handleResendEmail = () => {
    toast({
      title: "Email sent",
      description: "Confirmation email has been resent to your email address.",
    })
  }

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">Thank you for your purchase. Your order has been successfully placed.</p>
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
                <p className="font-medium">{orderData.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{orderData.date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                <p className="font-medium">{orderData.estimatedDelivery}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="secondary">Processing</Badge>
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
              {orderData.items.map((item) => (
                <div key={`${item.product_id}-${item.color_id}`} className="flex gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product_name}</h4>
                    <p className="text-sm text-muted-foreground">Color: {item.color_name}</p>
                    <p className="text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">${item.price} each</p>
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
                <span>${orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{orderData.shipping === 0 ? "Free" : `$${orderData.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${orderData.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${orderData.total.toFixed(2)}</span>
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
              <p className="text-sm">{orderData.shippingAddress}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Credit Card ending in {orderData.paymentMethod}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleDownloadReceipt} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
          <Button onClick={handleResendEmail} variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Resend Email
          </Button>
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
                  <p className="text-muted-foreground">We're preparing your items for shipment.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Shipping</p>
                  <p className="text-muted-foreground">You'll receive a tracking number once your order ships.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Delivery</p>
                  <p className="text-muted-foreground">Your order will arrive by {orderData.estimatedDelivery}.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
