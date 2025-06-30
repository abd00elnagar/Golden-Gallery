"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight, ShoppingBag, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { toggleFavorite, addToCartAction } from "@/lib/actions"
import type { Product } from "@/lib/types"
import { useRouter } from "next/navigation"
import { FaWhatsapp } from "react-icons/fa"

function FavoriteButton({ productId, userId, isFavorite, productLikes, onLikesUpdate }: {
  productId: string;
  userId?: string;
  isFavorite: boolean;
  productLikes: number;
  onLikesUpdate?: (likes: number) => void;
}) {
  const { pending } = useFormStatus()
  const [state, formAction] = useActionState(toggleFavorite, null)
  const { toast } = useToast()
  const [fav, setFav] = useState(isFavorite)
  const [favLook, setFavLook] = useState(isFavorite)
  const [likes, setLikes] = useState(productLikes)

  // Update state when props change
  useEffect(() => {
    setFav(isFavorite)
    setLikes(productLikes)
  }, [isFavorite, productLikes])

  // Handle form state changes
  useEffect(() => {
    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      })
      // Revert the UI state on error
      setFav(isFavorite)
      setFavLook(isFavorite)
      setLikes(productLikes)
      onLikesUpdate?.(productLikes)
    } else if (state?.success) {
      setFav(state.isFavorite)
      setLikes(state.likes)
      onLikesUpdate?.(state.likes)
      toast({
        title: "Success",
        description: state.message,
      })
    }
  }, [state, toast, isFavorite, productLikes, onLikesUpdate])

  if (!userId) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
      >
        <Heart className="h-4 w-4" />
        <span className="sr-only">Login to add favorite</span>
      </Button>
    )
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="isFavorite" value={fav.toString()} />
      <Button 
        type="submit" 
        variant="ghost" 
        size="icon"
        className="h-8 w-8" 
        disabled={pending}
        onClick={() => setFavLook(!favLook)}
      >
        <Heart className={`h-4 w-4 relative right-0 ${favLook ? "fill-red-500 text-red-500" : ""} ${pending ? "animate-pulse" : ""}`} />
        <span className="sr-only">Toggle favorite</span>
      </Button>
    </form>
  )
}

function AddToCartButton({ productId, userId, quantity, isOutOfStock }: { 
  productId: string; 
  userId?: string; 
  quantity: number;
  isOutOfStock: boolean;
}) {
  const { pending } = useFormStatus()
  const [state, formAction] = useActionState(addToCartAction, null)
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)

  // Handle form state changes
  useEffect(() => {
    if (state?.error) {
      setIsAdding(false)
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      })
    } else if (state?.success) {
      setIsAdding(false)
      toast({
        title: "Success",
        description: state.message,
      })
    }
  }, [state, toast])

  const handleSubmit = () => {
    setIsAdding(true)
  }

  if (!userId) {
    return (
      <Button size="sm" disabled={isOutOfStock}>
        <ShoppingCart className="h-4 w-4 mr-2" />
        {isOutOfStock ? "Out of Stock" : "Login to use Cart"}
      </Button>
    )
  }

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={quantity.toString()} />
      <Button type="submit" size="sm" disabled={isOutOfStock || pending || isAdding}>
        <ShoppingCart className="h-4 w-4 mr-2" />
        {isOutOfStock ? "Out of Stock" : (pending || isAdding) ? "Adding..." : "Add to Cart"}
      </Button>
    </form>
  )
}

function ProductDetails({ product, isFavorite, userId }: { 
  product: Product & { category?: { id: string; name: string; description: string | null; created_at: string } }, 
  isFavorite: boolean;
  userId?: string;
}) {
  const category = product?.category
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [currentLikes, setCurrentLikes] = useState(product?.likes || 0)
  const [quantity, setQuantity] = useState(1)
  const router = useRouter();

  // Update likes when product changes
  useEffect(() => {
    setCurrentLikes(product?.likes || 0)
  }, [product?.likes])

  if (!product) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const selectedColor = product.colors[selectedColorIndex] || product.colors[0]

  // Handle image navigation
  const handlePreviousImage = () => {
    if (selectedColorIndex > 0) {
      setSelectedColorIndex(selectedColorIndex - 1)
    } else {
      setSelectedColorIndex(product.colors.length - 1)
    }
  }

  const handleNextImage = () => {
    if (selectedColorIndex < product.colors.length - 1) {
      setSelectedColorIndex(selectedColorIndex + 1)
    } else {
      setSelectedColorIndex(0)
    }
  }

  // Handle color selection and update image
  const handleColorSelect = (index: number) => {
    setSelectedColorIndex(index)
  }

  const handleBuyNow = () => {
    router.push(`/checkout?productId=${product.id}&quantity=${quantity}`)
  }
  const waMessage = encodeURIComponent(`Hello, I want to order:\n${product.name} - ${product.price} EGP\n${typeof window !== 'undefined' ? window.location.href : ''}`)
  const waLink = `https://wa.me/201234567890?text=${waMessage}`

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        {category &&
          (<>
            <span className="text-muted-foreground">/</span>
            <Link href={`/category/${category.id}`} className="text-sm text-muted-foreground hover:text-primary">
              {category?.name}
            </Link>
          </>)
        }
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg border">
            <Image
              src={selectedColor?.image || product.images?.[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            
            {/* Navigation Arrows */}
            {product.colors.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm"
                  onClick={handlePreviousImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>

          {/* Color Images */}
          {product.colors.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.colors.map((color, index) => (
                <button
                  key={index}
                  className={`aspect-square relative overflow-hidden rounded border-2 ${selectedColorIndex === index ? "border-primary" : "border-muted"}`}
                  onClick={() => handleColorSelect(index)}
                  aria-label={`Select ${color.name} color`}
                >
                  <Image
                    src={color.image || "/placeholder.svg"}
                    alt={`${product.name} - ${color.name}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{category?.name}</Badge>
              {product.stock < 5 && product.stock > 0 && <Badge variant="destructive">Only {product.stock} left</Badge>}
              {product.stock === 0 && <Badge variant="secondary">Out of stock</Badge>}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <FavoriteButton
                productId={product.id}
                userId={userId}
                isFavorite={isFavorite}
                productLikes={currentLikes}
                onLikesUpdate={setCurrentLikes}
              />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold">${product.price}</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                {currentLikes} likes
                <span>•</span>
                <ShoppingCart className="h-4 w-4" />
                {product.ordered} sold
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          <Separator />

          {/* Color Selection */}
          {product.colors.length > 1 && (
            <div>
              <h3 className="font-semibold mb-3">Color: {selectedColor?.name}</h3>
              <div className="flex gap-3">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    className={`w-10 h-10 rounded-full border-2 ${selectedColorIndex === index ? "border-primary" : "border-muted"}`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleColorSelect(index)}
                    aria-label={`Select ${color.name} color`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div>
            <h3 className="font-semibold mb-3">Quantity</h3>
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                +
              </Button>
              <div className="flex-1">
                <AddToCartButton
                  productId={product.id}
                  userId={userId}
                  quantity={quantity}
                  isOutOfStock={product.stock === 0}
                />
              </div>
            </div>

            {/* Action Buttons: Buy Now & WhatsApp */}
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold shadow hover:from-yellow-600 hover:to-yellow-700 transition-colors duration-200"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                type="button"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Buy Now
              </Button>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button
                  size="lg"
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold shadow transition-colors duration-200 flex items-center justify-center"
                  type="button"
                >
                  <FaWhatsapp className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>

          <Separator />

          {/* Product Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock:</span>
                  <span>{product.stock} available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{category?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Added:</span>
                  <span>{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
