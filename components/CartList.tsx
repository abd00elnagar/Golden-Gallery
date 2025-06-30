"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { useFormStatus } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus, ShoppingBag, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { updateCartQuantityAction, removeFromCartAction } from "@/lib/actions"

interface CartItem {
  productId: string
  productName: string
  price: number
  image: string | null
  quantity: number
  stock: number
}

function CartItemActions({ item, onUpdate, onRemove }: {
  item: CartItem
  onUpdate: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}) {
  const { pending } = useFormStatus()
  const [quantity, setQuantity] = useState(item.quantity)
  const [isPending, startTransition] = useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  // Update local quantity when item.quantity changes
  useEffect(() => {
    setQuantity(item.quantity)
  }, [item.quantity])

  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity < 0 || newQuantity > item.stock) return
    
    // Optimistic update
    setQuantity(newQuantity)
    onUpdate(item.productId, newQuantity)
    
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('productId', item.productId)
        formData.append('quantity', newQuantity.toString())
        const result = await updateCartQuantityAction(null, formData)
        if (result?.error) {
          // Revert on error
          setQuantity(item.quantity)
          onUpdate(item.productId, item.quantity)
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: result?.message || "Quantity updated",
          })
        }
      } catch (error) {
        // Revert on error
        setQuantity(item.quantity)
        onUpdate(item.productId, item.quantity)
        toast({
          title: "Error",
          description: "Failed to update quantity",
          variant: "destructive",
        })
      }
    })
  }, [item.productId, item.quantity, item.stock, onUpdate, startTransition, toast])

  const handleRemove = useCallback(() => {
    setShowDeleteDialog(false)
    // Optimistic update
    onRemove(item.productId)
    
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('productId', item.productId)
        const result = await removeFromCartAction(null, formData)
        if (result?.error) {
          // Revert on error - add item back
          onUpdate(item.productId, item.quantity)
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: result?.message || "Item removed",
          })
        }
      } catch (error) {
        // Revert on error - add item back
        onUpdate(item.productId, item.quantity)
        toast({
          title: "Error",
          description: "Failed to remove item",
          variant: "destructive",
        })
      }
    })
  }, [item.productId, item.quantity, onRemove, onUpdate, startTransition, toast])

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          asChild
        >
          <Link href={`/product/${item.productId}`}>
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">View product</span>
          </Link>
        </Button>
        
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove item</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Item</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove "{item.productName}" from your cart? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRemove} disabled={isPending}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          disabled={isPending || quantity <= 1}
          onClick={() => handleQuantityChange(quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <span className="w-8 text-center">{quantity}</span>
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          disabled={isPending || quantity >= item.stock}
          onClick={() => handleQuantityChange(quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export default function CartList({ cartItems: initialCartItems }: { cartItems: CartItem[] }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)

  const handleUpdateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(items => items.filter(item => item.productId !== productId))
    } else {
      setCartItems(items =>
        items.map(item =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }, [])

  const handleRemove = useCallback((productId: string) => {
    setCartItems(items => items.filter(item => item.productId !== productId))
  }, [])

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
                <CartItemActions 
                  item={item}
                  onUpdate={handleUpdateQuantity} 
                  onRemove={handleRemove} 
                />
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