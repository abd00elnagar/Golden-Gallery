"use client"

import { useState, useCallback } from "react"
import { useFormStatus } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useActionState } from "react"
import { updateCartQuantityAction, removeFromCartAction } from "@/lib/actions"

interface CartItem {
  productId: string
  productName: string
  price: number
  image: string | null
  quantity: number
  stock: number
}

function CartItemActions({ item }: { item: CartItem }) {
  const { pending } = useFormStatus()
  const { toast } = useToast()

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Remove button */}
      <form action={removeFromCartAction}>
        <input type="hidden" name="productId" value={item.productId} />
        <Button 
          type="submit" 
          variant="ghost" 
          size="icon" 
          disabled={pending}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove item</span>
        </Button>
      </form>

      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <form action={updateCartQuantityAction}>
          <input type="hidden" name="productId" value={item.productId} />
          <input type="hidden" name="quantity" value={Math.max(0, item.quantity - 1)} />
          <Button
            type="submit"
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            disabled={pending || item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
        </form>
        
        <span className="w-8 text-center">{item.quantity}</span>
        
        <form action={updateCartQuantityAction}>
          <input type="hidden" name="productId" value={item.productId} />
          <input type="hidden" name="quantity" value={item.quantity + 1} />
          <Button
            type="submit"
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            disabled={pending || item.quantity >= item.stock}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function CartList({ cartItems: initialCartItems }: { cartItems: CartItem[] }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)
  const { toast } = useToast()

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 15
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (cartItems.length === 0) {
    return (
      <div className="text-center max-w-md mx-auto">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {cartItems.map((item) => (
          <Card key={item.productId}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.productName}</h3>
                  <p className="text-lg font-bold mt-2">${item.price}</p>
                </div>
                <CartItemActions item={item} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Summary */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {shipping > 0 && <p className="text-sm text-muted-foreground">Free shipping on orders over $100</p>}
            <Button className="w-full" size="lg" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 