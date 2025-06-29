"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart, Link2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useActionState } from "react"
import { toggleFavorite, addToCartAction } from "@/lib/actions"
import type { Product } from "@/lib/types"
import { useFormStatus } from "react-dom"

interface ProductCardProps {
  product: Product
  isFavorite: boolean
  userId?: string
}

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
        className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background z-10"
      >
        <Heart className="h-4 w-4" />
        <span className="sr-only">Login to add favorite</span>
      </Button>
    )
  }

  return (
    <div className="absolute top-2 right-2 z-10">
      <form action={formAction}>
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="isFavorite" value={fav.toString()} />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={pending}
          onClick={()=> setFavLook(!favLook)}
          className="h-8 w-8 bg-background/80 hover:bg-background"
        >
          <Heart className={`h-4 w-4 ${favLook ? "fill-red-500 text-red-500" : ""} ${pending ? "animate-pulse" : ""}`} />
          <span className="sr-only">Toggle favorite</span>
        </Button>
      </form>
    </div>
  )
}

function AddToCartButton({ productId, userId, isOutOfStock }: { productId: string; userId?: string; isOutOfStock: boolean }) {
  const [state, formAction] = useActionState(addToCartAction, null)
  const { toast } = useToast()
  const [pending, setPending] = useState(false)

  // Handle form state changes
  useEffect(() => {
    if (state?.error) {
      setPending(false)
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      })
    } else if (state?.success) {
      setPending(false)
      toast({
        title: "Success",
        description: state.message,
      })
    }
  }, [state, toast])

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPending(true)
  }

  if (!userId) {
    return (
      <Button className="w-full" disabled={isOutOfStock} onClick={handleButtonClick}>
        <ShoppingCart className="h-4 w-4 mr-2" />
        {isOutOfStock ? "Out of Stock" : "Login to Add to Cart"}
      </Button>
    )
  }

  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value="1" />
      <Button type="submit" className="w-full" disabled={isOutOfStock || pending}>
        <ShoppingCart className="h-4 w-4 mr-2" />
        {isOutOfStock ? "Out of Stock" : pending ? "Adding..." : "Add to Cart"}
      </Button>
    </form>
  )
}

export function ProductCard({ product, isFavorite, userId }: ProductCardProps) {
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock < 5 && product.stock > 0
  const [currentLikes, setCurrentLikes] = useState(product.likes)

  // Update likes when product changes
  useEffect(() => {
    setCurrentLikes(product.likes)
  }, [product.likes])

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <FavoriteButton
        productId={product.id}
        userId={userId}
        isFavorite={isFavorite}
        productLikes={product.likes}
        onLikesUpdate={setCurrentLikes}
      />
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.images?.[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          priority
        />
        {product.featured && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
        <Badge className="absolute top-2 right-12 w-8 h-8 p-0 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center rounded-md">
          <Link href={`/product/${product.id}`} className="flex items-center justify-center w-full h-full">
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Badge>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="secondary" className="text-lg">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1 hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold">${product.price}</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="h-3 w-3" />
            {currentLikes}
          </div>
        </div>

        {/* Color Selection - Always reserve space */}
        <div className="mb-4 h-8 flex items-center">
          {product.colors && product.colors.length > 1 ? (
            <div className="flex gap-2">
              {product.colors.map((color, ind) => (
                <div
                  key={ind}
                  className={`w-5 h-5 rounded-full border-2 shadow-lg transition-all`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Select ${color.name} color`}
                />
              ))}
            </div>
          ) : (
            // Empty placeholder to maintain consistent layout
            <div className="w-6 h-6" />
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <AddToCartButton productId={product.id} userId={userId} isOutOfStock={isOutOfStock} />


      </CardFooter>
    </Card>
  )
}
