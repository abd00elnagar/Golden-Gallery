"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { mockProducts, mockUser } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(mockUser.favorites)
  const { toast } = useToast()

  const favoriteProducts = mockProducts.filter((product) => favorites.includes(product.id))

  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]

      toast({
        title: prev.includes(productId) ? "Removed from favorites" : "Added to favorites",
        description: prev.includes(productId)
          ? "Product removed from your favorites"
          : "Product added to your favorites",
      })

      return newFavorites
    })
  }

  const handleAddToCart = (productId: string, colorId: string) => {
    toast({
      title: "Added to cart",
      description: "Product has been added to your cart",
    })
  }

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Favorites</h1>
          <p className="text-muted-foreground">
            {favoriteProducts.length} {favoriteProducts.length === 1 ? "item" : "items"} in your favorites
          </p>
        </div>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="text-center max-w-md mx-auto">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-6">
            Start browsing and add products to your favorites to see them here.
          </p>
          <Button asChild>
            <Link href="/">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Start Shopping
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={handleToggleFavorite}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  )
}
