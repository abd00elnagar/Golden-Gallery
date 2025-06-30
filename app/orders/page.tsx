import Link from "next/link"
import { Eye, Download, Mail, Package, Truck, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getUserOrders } from "@/lib/actions"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"

const statusIcons = {
  pending: Package,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

const statusColors = {
  pending: "secondary",
  processing: "outline",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
} as const

export default async function OrdersPage() {
  const user = await getUser()
  if (!user) {
    redirect('/auth/signin')
  }

  const orders = await getUserOrders(user.id)

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">When you place your first order, it will appear here.</p>
            <Button asChild>
              <Link href="/">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.status]
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
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusColors[order.status]} className="capitalize">
                        {order.status}
                      </Badge>
                      <span className="text-lg font-bold">${order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Items:</span> {order.items.length}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Payment:</span> {order.payment_method}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Shipping:</span> {order.shipping_address}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Order {order.order_number}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Order Status */}
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-5 w-5" />
                              <Badge variant={statusColors[order.status]} className="capitalize">
                                {order.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Order Items */}
                            <div>
                              <h3 className="font-semibold mb-3">Items ({order.items.length})</h3>
                              <div className="space-y-3">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex gap-3 p-3 border rounded-lg">
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
                                        <p className="text-sm text-muted-foreground">Color: {item.color_name}</p>
                                      )}
                                      <p className="text-sm">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                      <p className="text-sm text-muted-foreground">${item.price} each</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Shipping Information */}
                            <div>
                              <h3 className="font-semibold mb-3">Shipping Information</h3>
                              <div className="p-3 border rounded-lg space-y-1">
                                <p className="text-sm">{order.shipping_address}</p>
                                <p className="text-sm">Phone: {order.shipping_phone}</p>
                              </div>
                            </div>

                            {/* Order Total */}
                            <div>
                              <h3 className="font-semibold mb-3">Order Total</h3>
                              <div className="p-3 border rounded-lg">
                                <div className="flex justify-between text-lg font-bold">
                                  <span>Total</span>
                                  <span>${order.total_amount.toFixed(2)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground capitalize">Paid via {order.payment_method}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" size="sm" disabled>
                        <Mail className="h-4 w-4 mr-2" />
                        Resend Email
                      </Button>

                      <Button variant="outline" size="sm" disabled>
                        <Download className="h-4 w-4 mr-2" />
                        Invoice
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
